// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

const detailedToStatusMap = {
    "New": "Open",
    "Under Review": "Open",
    "Awaiting Customer Info": "Replied",
    "Customer Responded": "Open",
    "Work in Progress": "Open",
    "Non-SLA – Transferred for Evaluation": "Replied",
    "Transferred to Project Tracker": "Resolved",
    "Resolved": "Resolved",
    "Closed": "Closed",
    "Cancelled": "Closed"
}

frappe.ui.form.on("HD Ticket", {
    refresh(frm) {
        frm.set_df_property("status", "read_only", true)
    },
    ehda_detailed_status: function (frm) {
        let status = getStatusFromDetailed(frm.doc.ehda_detailed_status)
        frm.set_value("status", status) 
    }
});

function getStatusFromDetailed(detailedStatus) {
    return detailedToStatusMap[detailedStatus]
}