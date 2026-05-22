import { jsPDF } from "jspdf";
import { getAppearanceLabel, getFollowUpTypeLabel, getVisitReasonLabel } from "./medicalData";

function addSectionTitle(doc, label, state) {
  state.y += 8;
  if (state.y > 270) {
    doc.addPage();
    state.y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(label, 14, state.y);
  state.y += 6;
}

function addKeyValue(doc, label, value, state) {
  const lines = doc.splitTextToSize(`${label}: ${value || "--"}`, 180);
  if (state.y + lines.length * 6 > 280) {
    doc.addPage();
    state.y = 20;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(lines, 14, state.y);
  state.y += lines.length * 6;
}

export function generateReportPDF(report, t) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const state = { y: 18 };

  doc.setFillColor(15, 110, 86);
  doc.roundedRect(14, 12, 182, 22, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("VitaKid", 20, 24);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(t("reports.logoPlaceholder"), 20, 30);
  doc.text(t("reports.pdfTitle"), 146, 24);
  doc.text(report.visitDate || "--", 171, 30, { align: "right" });
  doc.setTextColor(16, 35, 29);
  state.y = 42;

  addSectionTitle(doc, t("reports.sectionVisitInfo"), state);
  addKeyValue(doc, t("reports.visitDate"), report.visitDate, state);
  addKeyValue(doc, t("reports.visitTime"), report.visitTime, state);
  addKeyValue(doc, t("reports.staffMember"), report.staffName, state);
  addKeyValue(doc, t("reports.roleSpecialisation"), report.staffRole, state);

  addSectionTitle(doc, t("reports.sectionPatientInfo"), state);
  addKeyValue(doc, t("reports.patientFullName"), report.patientName, state);
  addKeyValue(doc, t("reports.patientDob"), report.patientDob, state);
  addKeyValue(doc, t("reports.guardianName"), report.guardianName, state);
  addKeyValue(doc, t("reports.homeAddress"), report.address, state);
  addKeyValue(doc, t("reports.municipality"), report.municipality, state);

  addSectionTitle(doc, t("reports.sectionReason"), state);
  addKeyValue(
    doc,
    t("reports.reasonForVisit"),
    report.visitReasons?.map((reason) => getVisitReasonLabel(reason, t)).join(", "),
    state,
  );
  if (report.otherReason) {
    addKeyValue(doc, t("reports.otherReason"), report.otherReason, state);
  }

  addSectionTitle(doc, t("reports.sectionClinical"), state);
  addKeyValue(doc, t("reports.generalAppearance"), getAppearanceLabel(report.generalAppearance, t), state);
  addKeyValue(doc, t("reports.temperature"), report.temperature, state);
  addKeyValue(doc, t("reports.weight"), report.weight, state);
  addKeyValue(doc, t("reports.height"), report.height, state);
  addKeyValue(doc, t("reports.visibleSymptoms"), report.symptoms, state);
  addKeyValue(doc, t("reports.medicationsGiven"), report.medicationsGiven, state);
  addKeyValue(doc, t("reports.vaccinesAdministered"), report.vaccinesAdministered?.join(", "), state);

  addSectionTitle(doc, t("reports.sectionAssessment"), state);
  addKeyValue(doc, t("reports.assessmentNotes"), report.assessment, state);
  addKeyValue(doc, t("reports.actionsTaken"), report.actionsTaken, state);
  addKeyValue(doc, t("reports.followUpRequired"), report.followUpRequired ? t("common.yes") : t("common.no"), state);
  if (report.followUpRequired) {
    addKeyValue(doc, t("reports.followUpDate"), report.followUpDate, state);
    addKeyValue(doc, t("reports.followUpType"), getFollowUpTypeLabel(report.followUpType, t), state);
  }
  if (report.referralDetails) {
    addKeyValue(doc, t("reports.referralDetails"), report.referralDetails, state);
  }

  if (report.signatureDataUrl) {
    if (state.y > 210) {
      doc.addPage();
      state.y = 20;
    }
    addSectionTitle(doc, t("reports.signature"), state);
    doc.addImage(report.signatureDataUrl, "PNG", 14, state.y, 80, 30);
  }

  doc.save(`home-visit-report-${report.patientName || "patient"}.pdf`);
}

export default generateReportPDF;
