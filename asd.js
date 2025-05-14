const ETMS_HD_STATUSES = [
    "New",
    "Under Review",
    "Awaiting Customer Info",
    "Customer Responded",
    "Work in Progress",
    "Non-SLA – Transferred for Evaluation",
    "Transferred to Project Tracker",
    "Resolved",
    "Closed",
    "Cancelled"
]

const ETMS_HD_STATUS_MAP = {
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

function patch_status_chip(txt) {
    const elID = "#etms_detailed_status_chip"

    if (!m_patch.$(elID).length) {
        tmpl = `
            <div id="etms_detailed_status_chip" class="flex items-center justify-between">
                <div class="inline-flex select-none items-center gap-1 rounded-full text-ink-blue-3 bg-surface-gray-2 h-5 text-xs px-1.5 -ml-1"
                     data-state="delayed-open" data-grace-area-trigger="" aria-describedby="reka-tooltip-content-v-0-18">
                     ${txt}
                </div>
            </div>
        `
        let target = $(`div > span:contains('#${m_patch.doc.name}')`).parent()
        target.prepend(tmpl)
    } else {
        m_patch.$(elID).find("div").text(txt)
    }

}

function confirm_create_related_sla() {
    m_patch.$dialog({
        title: "Confirm Action",
        message: `Are you sure you want Create & Link Non-SLA for Ticket (${m_patch.doc.name})`,
        actions: [
            {
                label: "Create Related Non-SLA",
                theme: "green",
                variant: "solid",
                async onClick(close) {
                    $(document.body).css("filter", "opacity(0.3)")
                    m_patch.call("etms_hd_addons.api.create_non_sla_form", {
                        ticket_name: m_patch.doc.name
                    }).then(res => {
                        console.log(res);

                        if (res.status == 200) {

                            setTimeout(() => {
                                //location.reload()
                                $(document.body).css("filter", "opacity(1)")
                                m_patch.createToast({
                                    title: "ETMS HD: Non-SLA Form Created & Linked",
                                    icon: "alert-circle",
                                });
                                setTimeout(() => location.reload(), 1500)
                            }, 1000)

                            // m_patch.updateField("ehda_detailed_status", hdStatus, () => {
                            //     setTimeout(() => {
                            //         m_patch.updateField("status", mappedStatus)
                            //         m_patch.createToast({
                            //             title: "ETMS HD: Transition Successfull",
                            //             icon: "alert-circle",
                            //         });


                            //     }, 2000)
                            // })

                            // open(`/app/non-sla-request-evaluation-form/${res.data.name}`)
                        }
                    }).finally((er) => $(document.body).css("filter", "opacity(1)"))


                    // m_patch.doc.ehda_detailed_status =  hdStatus
                    // m_patch.doc.status =  mappedStatus


                    // m_patch.updateField("status", mappedStatus)
                    close();

                },
            },
            {
                label: "Cancel",
                variant: "outline",
                onClick(close) {
                    close();
                },
            },
        ],
    }
    );
}

function confirm_transition(hdStatus, mappedStatus) {
    m_patch.$dialog({
        title: "Confirm Transition",
        message: `Are you sure you want transition from (${m_patch.doc.ehda_detailed_status}) to (${hdStatus})`,
        actions: [
            {
                label: "Transition",
                theme: "green",
                variant: "solid",
                async onClick(close) {
                    $(document.body).css("filter", "opacity(0.3)")
                    // m_patch.doc.ehda_detailed_status =  hdStatus
                    // m_patch.doc.status =  mappedStatus
                    m_patch.updateField("ehda_detailed_status", hdStatus, () => {
                        setTimeout(() => {
                            m_patch.updateField("status", mappedStatus)
                            $(document.body).css("filter", "opacity(1)")
                            m_patch.createToast({
                                title: "ETMS HD: Transition Successfull",
                                icon: "alert-circle",
                            });


                        }, 2000)
                    })


                    // m_patch.updateField("status", mappedStatus)
                    close();


                },
            },
            {
                label: "Cancel",
                variant: "outline",
                onClick(close) {
                    close();
                },
            },
        ],
    }
    );
}

function ready() {
    statusBtn = m_patch.$(`div > button > span:contains('${m_patch.doc.status}')`)
    console.log(statusBtn)
    statusBtn.parent().parent().css("pointer-events", "none")
    statusBtn.parent().parent().parent().remove()

    m_patch.$("div:contains('Detailed Status ')[data-state]").parent().css("pointer-events", "none")

    // emulate vue fake button
    // inject only if not injected
    if (!m_patch.doc.ehda_detailed_status) m_patch.doc.ehda_detailed_status = "Draft"

    patch_status_chip(m_patch.doc.ehda_detailed_status)
}

// status <-> hd statuus builder & mapper
function build_etms_statuses() {
    let items = []
    for (let i = 0; i < ETMS_HD_STATUSES.length; i++) {
        let hdStatus = ETMS_HD_STATUSES[i]
        let mappedStatus = ETMS_HD_STATUS_MAP[hdStatus]

        items.push(
            {
                label: `${hdStatus}`,
                onClick: () => {
                    confirm_transition(hdStatus, mappedStatus)
                },
            },
        )
    }
    return items
}

function build_actions() {
    const actions = {
        actions: [{
            "buttonLabel": "Detailed Status",
            "group": "---",
            "hideLabel": true,
            "items": build_etms_statuses()
        },
        ...m_patch.doc.ehda_detailed_status == 'Non-SLA – Transferred for Evaluation' && !m_patch.doc.ehda_non_sla_form ? [{
            "label": "Create Non-SLA Form",
            "onClick": () => {
                confirm_create_related_sla()
            }
        }] : [],
        ...m_patch.doc.ehda_non_sla_form ? [{
            "label": "Open Non-SLA Form",
            "onClick": () => {
                open(`/app/non-sla-request-evaluation-form/${m_patch.doc.ehda_non_sla_form}`)
            }
        }] : [],

        ],
        onChange: {
            // works only for new ticket page
            "fieldname": (newVal) => console.log(newVal)
        }
    }
    return actions
}

// PREPARATION
const JQUERY_CDN = "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"

function load_hook(doc, updateField, call, router, $dialog, createToast, applyFilters) {
    var script = document.createElement('script');
    script.onload = function () {

        // add jquery to etms patches
        window.m_patch['$'] = jQuery

        // notify list/form ready
        ready()
    };
    script.src = JQUERY_CDN;
    document.head.appendChild(script);
}


function setupForm({ doc, updateField, call, router, $dialog, createToast, applyFilters }) {

    // init new namespace & inject monkey patch tools
    window['m_patch'] = {
        doc,
        updateField,
        call,
        router,
        $dialog,
        createToast,
        applyFilters
    }

    // hook early
    load_hook(doc, updateField, call, router, $dialog, createToast, applyFilters)
    return build_actions()
}
