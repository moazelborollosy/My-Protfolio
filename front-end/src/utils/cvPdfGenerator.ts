/**
 * Zero-dependency PDF 1.4 generator using standard Helvetica / Helvetica-Bold Type1 fonts.
 * Builds a clean, ATS-readable single-page engineering CV directly from the DynamoDB portfolio items
 * and returns a Base64-encoded PDF string ready to stage in S3.
 */

function escapePdfText(input: string): string {
  return (input || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00B7/g, ' - ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function generateCvPdfBase64(items: Record<string, unknown>[]): string {
  const byPk = (pk: string) =>
    items
      .filter((i) => i.pk === pk && i.isVisible !== false)
      .sort((a, b) => Number(a.displayOrder ?? 9999) - Number(b.displayOrder ?? 9999));

  const profile = items.find((i) => i.pk === 'PROFILE' && i.sk === 'CONFIG') || {};
  const education = byPk('EDUCATION');
  const projects = byPk('PROJECT');
  const skillGroups = byPk('SKILL_GROUP');
  const achievements = byPk('ACHIEVEMENT');

  const firstName = String(profile.firstName || 'Moaz');
  const lastName = String(profile.lastName || 'Elborollosy');
  const links = (profile.links as Record<string, string>) || {};
  const email = links.email || 'mozaelborollosy@gmail.com';
  const github = links.github || 'https://github.com/moazelborollosy';
  const linkedin = links.linkedin || 'https://www.linkedin.com/in/moaz-elborollosy-501885338/';
  const location = String(profile.contactLocation || 'Berlin, Germany');
  const summary = String(profile.heroDescription || '');
  const spokenLanguages = String(profile.spokenLanguages || '');

  const ops: string[] = [];
  let y = 795; // A4 height = 841.89 pt, top margin ~47 pt
  const left = 48;
  const right = 547;

  const drawText = (text: string, x: number, yPos: number, font: 'F1' | 'F2', size: number) => {
    ops.push(`BT /${font} ${size} Tf ${x} ${yPos.toFixed(1)} Td (${escapePdfText(text)}) Tj ET`);
  };

  const drawRule = (yPos: number) => {
    ops.push(`0.75 w 0.78 0.82 0.86 RG ${left} ${yPos.toFixed(1)} m ${right} ${yPos.toFixed(1)} l S`);
  };

  const addSectionHeader = (title: string) => {
    y -= 10;
    drawText(title.toUpperCase(), left, y, 'F2', 10.5);
    y -= 4;
    drawRule(y);
    y -= 13;
  };

  // Header
  drawText(`${firstName} ${lastName}`, left, y, 'F2', 20);
  y -= 15;
  drawText(`${location}  |  ${email}  |  ${github.replace('https://', '')}`, left, y, 'F1', 9.5);
  y -= 12;
  drawText(linkedin.replace('https://www.', ''), left, y, 'F1', 9);
  y -= 8;

  // Summary
  if (summary) {
    addSectionHeader('Profile');
    for (const line of wrapText(summary, 96)) {
      drawText(line, left, y, 'F1', 9.5);
      y -= 12.5;
    }
  }

  // Education
  if (education.length > 0) {
    addSectionHeader('Education');
    for (const edu of education) {
      drawText(
        `${edu.institution || ''} ${edu.institutionShort || ''} - ${edu.degree || ''}`,
        left,
        y,
        'F2',
        10
      );
      y -= 12.5;
      drawText(
        `${edu.dateRange || ''}  |  ${edu.location || ''}  |  ${edu.gpa || ''}`,
        left,
        y,
        'F1',
        9
      );
      y -= 12.5;
      if (edu.coursework) {
        for (const line of wrapText(String(edu.coursework), 96)) {
          drawText(line, left, y, 'F1', 9);
          y -= 12;
        }
      }
      y -= 3;
    }
  }

  // Projects
  if (projects.length > 0) {
    addSectionHeader('Selected Engineering Projects');
    for (const proj of projects) {
      if (y < 90) break;
      const techList = Array.isArray(proj.technologies) ? (proj.technologies as string[]).join(', ') : '';
      drawText(`${proj.title || ''} (${proj.category || ''})`, left, y, 'F2', 9.8);
      if (techList) {
        drawText(`[${techList}]`, left + 235, y, 'F1', 8.5);
      }
      y -= 12;

      const bodyText = `${proj.contribution || proj.description || ''} ${proj.outcome ? `Outcome: ${proj.outcome}` : ''}`;
      for (const line of wrapText(bodyText, 98)) {
        if (y < 60) break;
        drawText(line, left + 8, y, 'F1', 8.8);
        y -= 11.5;
      }
      y -= 3;
    }
  }

  // Technical Skills
  if (skillGroups.length > 0 && y > 100) {
    addSectionHeader('Technical Skills');
    for (const group of skillGroups) {
      const list = Array.isArray(group.skills) ? (group.skills as string[]).join(', ') : '';
      drawText(`${group.title || ''}:`, left, y, 'F2', 9.2);
      drawText(list, left + 125, y, 'F1', 9.2);
      y -= 12.5;
    }
    if (spokenLanguages) {
      drawText(spokenLanguages, left, y, 'F1', 9);
      y -= 12.5;
    }
  }

  // Achievements
  if (achievements.length > 0 && y > 80) {
    addSectionHeader('Achievements');
    for (const ach of achievements) {
      drawText(`- ${ach.title || ''}: ${ach.text || ''}`, left, y, 'F1', 9);
      y -= 12;
    }
  }

  const contentStream = ops.join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return btoa(pdf);
}
