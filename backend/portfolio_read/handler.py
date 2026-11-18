import json
import os
from decimal import Decimal
import boto3

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["TABLE_NAME"]


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)


def sort_items(items):
    return sorted(
        [item for item in items if item.get("isVisible", True) is not False],
        key=lambda x: (int(x.get("displayOrder", 9999)), str(x.get("sk", ""))),
    )


def lambda_handler(event, context):
    table = dynamodb.Table(TABLE_NAME)
    response = table.scan()
    items = response.get("Items", [])

    while "LastEvaluatedKey" in response:
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))

    grouped = {
        "PROFILE": [],
        "PROJECT": [],
        "SKILL_GROUP": [],
        "ACHIEVEMENT": [],
        "INTEREST": [],
        "EDUCATION": [],
    }

    for item in items:
        pk = item.get("pk")
        if pk in grouped:
            grouped[pk].append(item)

    profile = next(
        (x for x in grouped["PROFILE"] if x.get("sk") == "CONFIG"),
        grouped["PROFILE"][0] if grouped["PROFILE"] else None,
    )

    payload = {
        "profile": profile,
        "projects": sort_items(grouped["PROJECT"]),
        "skillGroups": sort_items(grouped["SKILL_GROUP"]),
        "achievements": sort_items(grouped["ACHIEVEMENT"]),
        "interests": sort_items(grouped["INTEREST"]),
        "education": sort_items(grouped["EDUCATION"]),
    }

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=31536000, s-maxage=31536000",
        },
        "body": json.dumps(payload, cls=DecimalEncoder),
    }
