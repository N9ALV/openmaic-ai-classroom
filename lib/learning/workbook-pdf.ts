import { PDFDocument, StandardFonts, rgb, type PDFPage } from 'pdf-lib';
import { LEARNING_EDITION, type LearningLesson } from './lessons';
import {
  effectiveReview,
  educationContentHash,
  reviewSummary,
  type EducationReview,
} from './review';

/** Offline, paginated A4 workbook. No external fonts, browser service or AI call. */
export async function createLessonWorkbookPdf(
  lesson: LearningLesson,
  review?: EducationReview,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const hash = await educationContentHash(JSON.stringify({ edition: LEARNING_EDITION, lesson }));
  const effective = effectiveReview(review, hash);
  const status = reviewSummary(effective);
  pdf.setTitle(`${lesson.title} — workbook`);
  pdf.setSubject(`${LEARNING_EDITION}; ${status}`);
  pdf.setCreator('OpenMAIC learning library');
  let page: PDFPage;
  let y = 0;
  const margin = 44;
  const width = 595.28;
  const normalise = (text: string) =>
    [
      ...text
        .replace(/−/g, '-')
        .replace(/→/g, ' -> ')
        .replace(/\u202f/g, ' '),
    ]
      .map((c) => {
        try {
          font.encodeText(c);
          return c;
        } catch {
          return `[U+${c.codePointAt(0)!.toString(16).toUpperCase()}]`;
        }
      })
      .join('');
  const newPage = () => {
    page = pdf.addPage([width, 841.89]);
    y = 785;
  };
  const line = (text: string, size = 11, strong = false) => {
    if (y < 65) newPage();
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: strong ? bold : font,
      color: rgb(0.12, 0.15, 0.2),
    });
    y -= size * 1.5;
  };
  const paragraph = (text: string, size = 11, strong = false) => {
    const usedFont = strong ? bold : font;
    let buffer = '';
    // Break long source links as well as ordinary prose; never draw past the page.
    for (const word of normalise(text).split(/\s+/)) {
      const next = buffer ? `${buffer} ${word}` : word;
      if (usedFont.widthOfTextAtSize(next, size) <= width - margin * 2) {
        buffer = next;
        continue;
      }
      if (buffer) {
        line(buffer, size, strong);
        buffer = '';
      }
      for (const character of word) {
        if (usedFont.widthOfTextAtSize(buffer + character, size) > width - margin * 2) {
          line(buffer, size, strong);
          buffer = '';
        }
        buffer += character;
      }
    }
    if (buffer) line(buffer, size, strong);
    y -= 7;
  };
  const heading = (text: string) => {
    if (y < 120) newPage();
    paragraph(text, 14, true);
  };
  const answerSpace = () => {
    for (let i = 0; i < 4; i++) {
      if (y < 75) newPage();
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.4,
        color: rgb(0.7, 0.7, 0.7),
      });
      y -= 24;
    }
  };
  newPage();
  paragraph(lesson.title, 20, true);
  paragraph(`Edition ${LEARNING_EDITION}. ${status}`, 10);
  paragraph(
    'General education, not personal financial advice. Examples are hypothetical. Original pilot material, not an official IU course.',
  );
  heading('Learning objectives');
  lesson.objectives.forEach((text) => paragraph(`- ${text}`));
  for (const section of lesson.sections) {
    heading(section.heading);
    section.paragraphs.forEach((text) => paragraph(text));
  }
  heading('Practice exercise');
  paragraph(lesson.exercise);
  answerSpace();
  heading('Applied scenario');
  paragraph(lesson.scenario.situation);
  heading('Explain it in your own words');
  paragraph(lesson.scenario.reflection);
  answerSpace();
  heading('Knowledge check');
  lesson.questions.forEach((question, i) => {
    paragraph(`${i + 1}. ${question.prompt}`, 11, true);
    question.choices.forEach((choice, n) => paragraph(`${String.fromCharCode(65 + n)}. ${choice}`));
  });
  heading('Sources and review');
  paragraph(
    'Check the exact supporting passage, effective date, assumptions and limitations. Links alone do not establish verification.',
  );
  lesson.sources.forEach((source) => {
    paragraph(`${source.label} (${source.role})`, 11, true);
    paragraph(source.url, 9);
  });
  if (effective) {
    paragraph(status);
    effective.claims.forEach((claim) =>
      paragraph(
        `${claim.checked ? 'Reviewer checked' : 'Unchecked'}: ${claim.claim}\nSource: ${claim.sourceUrl || 'not recorded'}\nPassage: ${claim.location || 'not recorded'}\nEffective date: ${claim.effectiveDate || 'not recorded'}; retrieved: ${claim.retrievedDate || 'not recorded'}.`,
        9,
      ),
    );
  }
  newPage();
  heading('Answer section — read after trying the exercises');
  paragraph(lesson.scenario.workedExample);
  lesson.questions.forEach((question, i) => {
    paragraph(`${i + 1}. ${question.choices[question.correct]}`, 11, true);
    paragraph(question.explanation);
  });
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(
      `OpenMAIC | ${LEARNING_EDITION} | ${(effective?.status ?? 'draft').toUpperCase()} local record | ${i + 1}/${pages.length}`,
      { x: margin, y: 30, size: 8, font, color: rgb(0.3, 0.3, 0.3) },
    );
  });
  return pdf.save();
}
