// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

const StatusEnum = {
    new: "New",
    underReview: "Under Review",
    awaitingCustomerInfo: "Awaiting Customer Info",
    customerResponded: "Customer Responded",
    workInProgress: "Work in Progress",
    nonSlaEval: "Non-SLA – Transferred for Evaluation",
    transferredToProj: "Transferred to Project Tracker",
    resolved: "Resolved",
    closed: "Closed",
    cancelled: "Cancelled"
}

frappe.ui.form.on("HD Ticket", {
    refresh(frm) {
        frm.hd_ticket_old_status = frm.doc.status
        if ([StatusEnum.nonSlaEval, StatusEnum.transferredToProj].includes(frm.doc.status)) {
            frm.set_df_property("status", "read_only", true)
        }
        frm.set_df_property("ehda_detailed_status", "read_only", true)
    },
    status: function (frm) {
       if(frm.doc.status == StatusEnum.nonSlaEval){
           frm.set_value("status", frm.hd_ticket_old_status)
           frappe.show_alert("Cannot Change Ticket with Linked Non-SLA Form")
       }

       if(frm.doc.status == StatusEnum.transferredToProj){
           frm.set_value("status", frm.hd_ticket_old_status)
            frappe.show_alert("Transition to this status only allowed from Non SLA Form Workflow")
       }

    }
});

// function getStatusFromDetailed(detailedStatus) {
//     return detailedToStatusMap[detailedStatus]
// }