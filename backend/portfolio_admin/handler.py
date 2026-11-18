import base64
import datetime
import json
import os
import time
from decimal import Decimal
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
s3_client = boto3.client("s3")
cf_client = boto3.client("cloudfront")

TABLE_NAME = os.environ["TABLE_NAME"]
BUCKET_NAME = os.environ["BUCKET_NAME"]
DISTRIBUTION_ID = os.environ["DISTRIBUTION_ID"]

ACTIVE_CV_KEY = "assets/Moaz-Elborollosy-CV.pdf"
STAGED_CV_KEY = "assets/cv-staged/Moaz-Elborollosy-CV.pdf"
HISTORY_PREFIX = "assets/cv-history/"

CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def generate_ulid() -> str:
    """Generates a 26-character lexicographically sortable ULID using standard library."""
    timestamp_ms = int(time.time() * 1000)
    random_bytes = int.from_bytes(os.urandom(10), "big")

    time_chars = []
    for _ in range(10):
        time_chars.append(CROCKFORD_ALPHABET[timestamp_ms & 0x1F])
        timestamp_ms >>= 5
    time_part = "".join(reversed(time_chars))

    rand_chars = []
    for _ in range(16):
        rand_chars.append(CROCKFORD_ALPHABET[random_bytes & 0x1F])
        random_bytes >>= 5
    rand_part = "".join(reversed(rand_chars))

    return time_part + rand_part


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)


def response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
        },
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def s3_key_exists(key: str) -> bool:
    try:
        s3_client.head_object(Bucket=BUCKET_NAME, Key=key)
        return True
    except ClientError:
        return False


def archive_current_cv() -> str | None:
    """Copies the current active CV to a timestamped file instead of overwriting it."""
    if not s3_key_exists(ACTIVE_CV_KEY):
        return None
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    archive_key = f"{HISTORY_PREFIX}Moaz-Elborollosy-CV_{stamp}.pdf"
    s3_client.copy_object(
        Bucket=BUCKET_NAME,
        CopySource={"Bucket": BUCKET_NAME, "Key": ACTIVE_CV_KEY},
        Key=archive_key,
        ContentType="application/pdf",
        MetadataDirective="REPLACE",
    )
    return archive_key


def list_cv_versions() -> dict:
    staged = s3_key_exists(STAGED_CV_KEY)
    history = []
    res = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=HISTORY_PREFIX)
    for obj in sorted(
        res.get("Contents", []), key=lambda x: x["LastModified"], reverse=True
    ):
        key = obj["Key"]
        if key.endswith(".pdf"):
            history.append(
                {
                    "key": key,
                    "filename": key.split("/")[-1],
                    "size": obj["Size"],
                    "lastModified": obj["LastModified"].strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "url": f"/{key}",
                }
            )
    return {
        "activeKey": ACTIVE_CV_KEY,
        "activeUrl": f"/{ACTIVE_CV_KEY}",
        "hasStagedCv": staged,
        "stagedUrl": f"/{STAGED_CV_KEY}" if staged else None,
        "history": history,
    }


def touch_last_modified(table, ts: str):
    try:
        table.update_item(
            Key={"pk": "PROFILE", "sk": "CONFIG"},
            UpdateExpression="SET lastModifiedAt = :ts",
            ExpressionAttributeValues={":ts": ts},
        )
    except Exception:
        pass


def lambda_handler(event, context):
    table = dynamodb.Table(TABLE_NAME)
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    raw_path = event.get("rawPath", "")

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        body = {}

    # 1. GET /api/admin/items -> Return all items (including hidden) + CV version status
    if method == "GET" and raw_path == "/api/admin/items":
        scan_res = table.scan()
        items = scan_res.get("Items", [])
        while "LastEvaluatedKey" in scan_res:
            scan_res = table.scan(ExclusiveStartKey=scan_res["LastEvaluatedKey"])
            items.extend(scan_res.get("Items", []))

        items.sort(key=lambda x: (str(x.get("pk", "")), int(x.get("displayOrder", 9999)), str(x.get("sk", ""))))
        return response(200, {"items": items, "cv": list_cv_versions()})

    # 2. POST /api/admin/items -> Create new item with auto-generated ULID (or PROFILE#CONFIG)
    if method == "POST" and raw_path == "/api/admin/items":
        pk = body.get("pk")
        if not pk:
            return response(400, {"error": "Missing required field: pk"})

        sk = "CONFIG" if pk == "PROFILE" else (body.get("sk") or generate_ulid())
        ts = now_iso()

        # Auto-calculate displayOrder if not provided
        if "displayOrder" not in body and pk != "PROFILE":
            existing = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key("pk").eq(pk)
            ).get("Items", [])
            max_order = max([int(i.get("displayOrder", 0)) for i in existing], default=0)
            body["displayOrder"] = max_order + 10

        item = {
            **body,
            "pk": pk,
            "sk": sk,
            "isVisible": body.get("isVisible", True),
            "updatedAt": ts,
        }
        if pk == "PROFILE":
            item["lastModifiedAt"] = ts

        table.put_item(Item=item)
        if pk != "PROFILE":
            touch_last_modified(table, ts)

        return response(201, {"item": item})

    # 3. PUT /api/admin/items -> Update item OR batch reorder items
    if method == "PUT" and raw_path == "/api/admin/items":
        ts = now_iso()

        # Batch update support (e.g. reordering multiple items)
        if "items" in body and isinstance(body["items"], list):
            with table.batch_writer() as batch:
                for entry in body["items"]:
                    entry["updatedAt"] = ts
                    batch.put_item(Item=entry)
            touch_last_modified(table, ts)
            return response(200, {"updatedCount": len(body["items"]), "updatedAt": ts})

        pk = body.get("pk")
        sk = body.get("sk")
        if not pk or not sk:
            return response(400, {"error": "Missing pk or sk"})

        item = {**body, "pk": pk, "sk": sk, "updatedAt": ts}
        if pk == "PROFILE":
            item["lastModifiedAt"] = ts

        table.put_item(Item=item)
        if pk != "PROFILE":
            touch_last_modified(table, ts)

        return response(200, {"item": item})

    # 4. DELETE /api/admin/items -> Delete item by pk & sk
    if method == "DELETE" and raw_path == "/api/admin/items":
        qs = event.get("queryStringParameters") or {}
        pk = body.get("pk") or qs.get("pk")
        sk = body.get("sk") or qs.get("sk")
        if not pk or not sk:
            return response(400, {"error": "Missing pk or sk"})
        if pk == "PROFILE" and sk == "CONFIG":
            return response(400, {"error": "Cannot delete PROFILE#CONFIG singleton"})

        table.delete_item(Key={"pk": pk, "sk": sk})
        ts = now_iso()
        touch_last_modified(table, ts)
        return response(200, {"deleted": {"pk": pk, "sk": sk}, "updatedAt": ts})

    # 5. POST /api/admin/cv -> Stage a new CV PDF (or restore an archived CV into staging)
    if method == "POST" and raw_path == "/api/admin/cv":
        ts = now_iso()
        action = body.get("action", "stage_upload")

        if action == "restore" and body.get("archiveKey"):
            archive_key = body["archiveKey"]
            if not archive_key.startswith(HISTORY_PREFIX):
                return response(400, {"error": "Invalid archive key"})
            s3_client.copy_object(
                Bucket=BUCKET_NAME,
                CopySource={"Bucket": BUCKET_NAME, "Key": archive_key},
                Key=STAGED_CV_KEY,
                ContentType="application/pdf",
                MetadataDirective="REPLACE",
            )
            touch_last_modified(table, ts)
            return response(200, {"message": "Archived CV staged for next Update publish", "cv": list_cv_versions()})

        pdf_b64 = body.get("pdfBase64")
        if not pdf_b64:
            return response(400, {"error": "Missing pdfBase64 payload"})

        # Strip optional data URL prefix
        if "," in pdf_b64:
            pdf_b64 = pdf_b64.split(",", 1)[1]

        pdf_bytes = base64.b64decode(pdf_b64)
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=STAGED_CV_KEY,
            Body=pdf_bytes,
            ContentType="application/pdf",
            CacheControl="no-cache",
        )
        touch_last_modified(table, ts)
        return response(200, {"message": "CV staged for publish", "cv": list_cv_versions()})

    # 6. POST /api/admin/publish -> Unified "Update" action:
    #    - If a staged CV exists, archives/renames the current active CV with a timestamp and promotes staged CV
    #    - Invalidates CloudFront edge cache for /api/portfolio and /assets/Moaz-Elborollosy-CV.pdf
    #    - Records lastPublishedAt on PROFILE#CONFIG
    if method == "POST" and raw_path == "/api/admin/publish":
        ts = now_iso()
        archived_cv_key = None
        cv_promoted = False

        if s3_key_exists(STAGED_CV_KEY):
            archived_cv_key = archive_current_cv()
            s3_client.copy_object(
                Bucket=BUCKET_NAME,
                CopySource={"Bucket": BUCKET_NAME, "Key": STAGED_CV_KEY},
                Key=ACTIVE_CV_KEY,
                ContentType="application/pdf",
                CacheControl="public, max-age=31536000",
                MetadataDirective="REPLACE",
            )
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=STAGED_CV_KEY)
            cv_promoted = True

        inv = cf_client.create_invalidation(
            DistributionId=DISTRIBUTION_ID,
            InvalidationBatch={
                "Paths": {
                    "Quantity": 2,
                    "Items": [
                        "/api/portfolio",
                        f"/{ACTIVE_CV_KEY}",
                    ],
                },
                "CallerReference": f"publish-{time.time_ns()}",
            },
        )
        invalidation_id = inv["Invalidation"]["Id"]

        table.update_item(
            Key={"pk": "PROFILE", "sk": "CONFIG"},
            UpdateExpression="SET lastPublishedAt = :ts, lastInvalidationId = :inv",
            ExpressionAttributeValues={":ts": ts, ":inv": invalidation_id},
        )

        return response(
            200,
            {
                "publishedAt": ts,
                "invalidationId": invalidation_id,
                "cvPromoted": cv_promoted,
                "archivedCvKey": archived_cv_key,
                "cv": list_cv_versions(),
            },
        )

    return response(404, {"error": f"Unsupported route: {method} {raw_path}"})
