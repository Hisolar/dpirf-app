import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   DATA DEFINITIONS
═══════════════════════════════════════════════════════════════ */

const PHASES = [
  { id:1, name:"Context", std:"UK GDPR Arts 4–6, 9, 12–14 · DPA 2018 Pt 2 Ch 2",
    desc:"Establish what personal data your charity holds, why you hold it, and on what legal basis.",
    questions:[
      {id:"c1_1",text:"Do you know what personal data your charity collects?",guidance:"Personal data is any information that identifies someone — donor names, volunteer phone numbers, beneficiary health details. Mapping everything you collect is the essential first step."},
      {id:"c1_2",text:"Do you have a written record of your legal reason for collecting each type of personal data?",guidance:"UK law requires a specific lawful basis for every type of processing — consent, contract, legal obligation, legitimate interests, vital interests or public task. Document one before collection begins."},
      {id:"c1_3",text:"Do you collect sensitive information — for example health details, ethnic background, religious beliefs or criminal records?",guidance:"Special category data (UK GDPR Art 9) requires an additional legal condition beyond your Art 6 lawful basis. Document an Art 9(2) condition for every type you collect.",triggersWorkflow:"specialCategory"},
      {id:"c1_4",text:"Do you have a written record of all personal data your charity holds, what you use it for and who can see it?",guidance:"This is your Record of Processing Activities (RoPA) — required by UK GDPR Art 30. Free template at ico.org.uk"},
      {id:"c1_5",text:"Have you identified all outside companies that can access your personal data — for example your till provider or IT support?",guidance:"Any company that handles personal data on your behalf is a processor. You need a signed Data Processing Agreement (DPA) with each one. UK GDPR Art 28."},
      {id:"c1_6",text:"Do donors and the public know what you do with their data? Do staff and volunteers have a separate written notice?",guidance:"Privacy notices must be in plain English. They must cover: what data you collect, why, how long you keep it, and people's rights. Free templates at ico.org.uk"},
    ]},
  { id:2, name:"Leadership", std:"UK GDPR Arts 5(2), 24(1), 24(2) · ISO 22301 Cl 5.3",
    desc:"Assign accountability and ensure your organisation has the governance in place to manage data protection.",
    questions:[
      {id:"c2_1",text:"Is there a named person in your organisation who is responsible for data protection?",guidance:"This person does not need to be a legal expert — they just need to be the named point of contact for all data protection matters and breach reports."},
      {id:"c2_2",text:"Does your organisation have a written policy explaining how it handles personal data?",guidance:"A data protection policy covers what data you collect, why, how you keep it safe, and what staff should do if something goes wrong. Free template at ico.org.uk"},
      {id:"c2_3",text:"Has this policy been reviewed and approved by your manager, trustees or board?",guidance:"Leadership approval creates accountability. Even a brief email confirmation is sufficient — record the approval date on the policy itself."},
      {id:"c2_4",text:"Have you checked whether your organisation is required by law to appoint a Data Protection Officer?",guidance:"Most small charities do not need a DPO, but you must show you have checked. Free self-assessment guide at ico.org.uk — document your conclusion."},
      {id:"c2_5",text:"Do all staff and volunteers know who to contact if they spot a data protection problem?",guidance:"Everyone should know who the named data protection contact is and how to reach them. Display the Key Contacts card at your premises."},
    ]},
  { id:3, name:"Planning", std:"UK GDPR Arts 6, 7, 25, 32, 35 · DPA 2018 ss.70, 71, 114 · DUAA 2025 ss.70, 71 · EU CRA 2024 Annex I",
    desc:"Assess risks, plan how to manage them, and ensure privacy is built into new systems from the start.",
    questions:[
      {id:"c3_1",text:"Has your organisation carried out a formal check to identify the risks to personal data it holds?",guidance:"A risk assessment identifies what personal data you hold, what could go wrong, how likely it is, and what you can do to reduce the risk. Free guide at ico.org.uk",action:"Carry out a data protection risk assessment. Free guide at ico.org.uk"},
      {id:"c3_2",text:"Have you done a privacy risk assessment (DPIA) for activities that could seriously affect people — for example CCTV, health data or new technology?",guidance:"This is called a DPIA (Data Protection Impact Assessment). It is required by law before any high-risk processing begins. Free template at ico.org.uk",action:"Carry out a DPIA for any high-risk activities — especially CCTV, health data or new technology. Free template at ico.org.uk"},
      {id:"c3_3",text:"Before introducing a new system, app or process, do you check whether it could affect personal data?",guidance:"This is called privacy by design — building data protection in from the start rather than adding it later. Free guidance at ico.org.uk",action:"Introduce a privacy check before any new system or process is introduced. Free guidance at ico.org.uk"},
      {id:"c3_4",text:"Where you rely on people's permission to use their data, do you have a clear record of when and how that permission was given?",guidance:"If you collect data based on consent — for example for marketing — you must show when and how consent was given. Free guidance at ico.org.uk",action:"Document how you collect and record consent for any data processing that relies on people's permission."},
      {id:"c3_5",text:"If you have CCTV cameras, is there a visible sign at each entrance? Have you done a privacy risk assessment for the CCTV?",guidance:"CCTV is high-risk processing. A visible privacy notice and a DPIA are both legally required. If no CCTV, select Not applicable.",action:"Display a visible privacy notice at every CCTV camera entrance and complete a DPIA."},
      {id:"c3_6",text:"If you take card payments, have you confirmed with your card payment provider that you meet payment card security standards?",guidance:"PCI DSS is a security standard for card payments. Your payment provider can confirm your compliance status. If no card payments, select Not applicable.",action:"Contact your card payment provider to confirm your PCI DSS compliance status."},
    ]},
  { id:4, name:"Support", std:"UK GDPR Arts 12–14, 17, 28, 30, 37–39 · DUAA 2025 ss.92, 103, 164A · EU CRA 2024 Art 13",
    desc:"Put the right documents, processes and training in place to support data protection across your organisation.",
    questions:[
      {id:"c4_1",text:"Is there a written notice for donors and the public explaining what data you collect, why, and their rights?",guidance:"This privacy notice must be in plain English. It should be available on your website or displayed at your premises.",action:"Create a public privacy notice in plain English. Free template at ico.org.uk"},
      {id:"c4_2",text:"Do staff and volunteers receive a written notice explaining how their personal data is used by the organisation?",guidance:"Staff and volunteers have the same data protection rights as anyone else. Give the notice to all new staff and volunteers when they start.",action:"Create a staff and volunteer privacy notice."},
      {id:"c4_3",text:"Is there an up-to-date written record of all personal data your charity holds?",guidance:"Your Record of Processing Activities (RoPA) must be kept current. Review it annually and whenever you start collecting new data types.",action:"Create or update your Record of Processing Activities (RoPA). Free template at ico.org.uk"},
      {id:"c4_4",text:"If someone asks to see the personal data you hold about them, do you have a written process for responding within one calendar month?",guidance:"This is called a Subject Access Request (SAR). You must respond within one month for free.",action:"Document a Subject Access Request process with a one-month response commitment."},
      {id:"c4_5",text:"If someone asks you to delete their personal data, do you have a process for doing this and notifying any third parties?",guidance:"If you agree to delete, you must also tell any processors — such as your till provider — to delete it too.",action:"Create an erasure process including notifying processors."},
      {id:"c4_6",text:"Does every company that handles personal data on your behalf have a signed written agreement with you covering data protection?",guidance:"This is called a Data Processing Agreement (DPA). UK law requires one with every processor — till provider, IT support, payroll, cloud services.",action:"Put a signed Data Processing Agreement in place with every processor."},
      {id:"c4_7",text:"Have all staff and volunteers received basic training on data protection — including what a breach is and who to report it to?",guidance:"Training does not need to be formal. Even a 30-minute session is sufficient. Document who has completed training and when.",action:"Arrange basic data protection training for all staff and volunteers."},
      {id:"c4_8",text:"If someone makes a complaint about how their data has been handled, do you have a process for acknowledging it within 30 days?",guidance:"Under DUAA 2025 ss.103 and 164A, acknowledging within 30 days is a legal requirement.",action:"Create a complaint handling process with a 30-day acknowledgement commitment."},
    ]},
  { id:5, name:"Business Impact Analysis", std:"UK GDPR Arts 35, 9 · ISO 22301 Cl 8.2 · EU CRA 2024 Annex I Pt I 2(h)",
    desc:"Identify your critical activities, their data dependencies, and how quickly you need to recover them.",
    questions:[
      {id:"c5_1",text:"Have you written down which activities your charity absolutely cannot stop doing, even during a crisis?",guidance:"These are the things that, if they stopped, would cause serious harm — for example if donations could not be processed, or vulnerable beneficiaries could not be contacted.",action:"Identify and document your critical activities."},
      {id:"c5_3",text:"If your computer systems went down today, do you know how quickly you would need each critical activity back up and running?",guidance:"For each important activity, agree a maximum downtime — for example: 'our till system must be back within 4 hours' or 'donor records must be accessible within 24 hours'.",action:"Set a Recovery Time Objective for each critical activity."},
      {id:"c5_4",text:"Are your backup arrangements written down — what is backed up, how often, where it is stored and who is responsible?",guidance:"Backups are your safety net if data is lost or a system fails. Ask your IT support to confirm what is currently backed up and how often.",action:"Document your backup arrangements in writing."},
      {id:"c5_5",text:"Have you done a formal privacy risk check for your most critical activities — especially any that involve health data or large amounts of personal information?",guidance:"UK law requires a written privacy risk check (called a DPIA) before carrying out any activity that is likely to create high risk to individuals.",action:"Carry out a DPIA for any critical activity involving health data or large volumes of personal data."},
      {id:"c5_6",text:"Have you thought about what could happen to the people in your data — donors, volunteers or beneficiaries — if your systems failed or their personal information was exposed?",guidance:"For each important activity, ask: whose personal information is involved, and what harm could they suffer if that data was lost, corrupted or seen by the wrong people?",action:"Assess the impact on data subjects if your critical systems failed."},
    ]},
  { id:6, name:"Incident Response", std:"UK GDPR Arts 4(12), 33, 34, 28(3)(f) · DPA 2018 s.111 · EU CRA 2024 Art 14(2)(a–c)",
    desc:"THE MOST IMPORTANT PHASE. Build your capability to identify, manage and report a personal data breach within 72 hours.",
    questions:[
      {id:"c6_1",text:"Is there a named person responsible for managing a data breach — someone available even if the usual manager is absent?",guidance:"This is your Incident Lead. They do not need to be a data protection expert. Add their contact details to the Key Contacts tab now.",action:"Assign a named Incident Lead and add their details to the Key Contacts tab now."},
      {id:"c6_2",text:"Do you have a written step-by-step guide that tells staff what to do if a data breach or security incident occurs?",guidance:"See the Incident Response Plan tab for a ready-made eight-step template you can complete and print.",action:"Create a written incident response procedure. See the Incident Response Plan tab."},
      {id:"c6_3",text:"Do you keep a written record of all incidents involving personal data — including those you decided not to report to the ICO?",guidance:"This is your breach register. It is a legal requirement under UK GDPR Art 33(5). A simple spreadsheet or paper log is acceptable.",action:"Create a breach register. This is a legal requirement."},
      {id:"c6_4",text:"Do you have a template ready for reporting a data breach to the ICO within the 72-hour legal deadline?",guidance:"Having a template ready means you will not lose time under pressure. Use the ICO's online portal at ico.org.uk to report breaches.",action:"Prepare an ICO notification template in advance."},
      {id:"c6_5",text:"Do you have a plain English template for writing to people whose data has been seriously affected by a breach?",guidance:"Keep it short and clear — explain what happened, what data was affected, and what steps you have taken. Avoid legal jargon.",action:"Prepare a plain English individual notification template."},
      {id:"c6_6",text:"Do your contracts with IT suppliers require them to notify you promptly if there is a breach involving your data?",guidance:"This notification obligation must be written into your contract. It is a legal requirement under UK GDPR Art 28(3)(f).",action:"Check your supplier contracts include a data breach notification obligation."},
      {id:"c6_7",text:"Do all staff and volunteers know what a personal data breach looks like and know to report it immediately?",guidance:"Common examples: email sent to wrong person, lost phone, stolen paper records, unauthorised access to a system.",action:"Brief all staff and volunteers on what a personal data breach looks like and who to report it to."},
      {id:"c6_8",text:"Do you have a process for receiving and acting on security alerts from your IT suppliers?",guidance:"From September 2026, EU CRA Art 14(8) requires suppliers of digital products to notify users of security incidents. Prepare a process now.",action:"Set up a process for receiving security notifications from IT suppliers."},
    ]},
  { id:7, name:"Performance Evaluation", std:"UK GDPR Arts 24(1), 32(1)(d), 58(1), 83 · DPA 2018 ss.149, 155 · DUAA 2025 ss.101, 103, 164A · ISO 22301 Cl 9",
    desc:"Monitor and test your data protection arrangements to ensure they remain effective over time.",
    questions:[
      {id:"c7_1",text:"Is there a date set each year to review this framework and check whether anything needs updating?",guidance:"Set a specific date now and record it. Assign responsibility to the named data protection lead.",action:"Schedule an annual framework review date now."},
      {id:"c7_2",text:"Has your team practised what they would do in a data breach — for example by walking through a test scenario together?",guidance:"A tabletop exercise takes about 30 minutes. Choose a realistic scenario and walk through the Incident Response Plan steps together.",action:"Run a tabletop exercise. Use the Scenario Simulator tab to run and record exercises."},
      {id:"c7_3",text:"Do you track any measures of data protection performance — for example how quickly you respond to data requests or how many incidents have been reported?",guidance:"Even a simple annual count of SARs, incidents and supplier contract reviews demonstrates accountability to the ICO.",action:"Start tracking basic data protection metrics — number of SARs, incidents and supplier contract reviews."},
      {id:"c7_4",text:"Have you identified which documents you would need to show the ICO if they contacted you for an audit or investigation?",guidance:"Use the Documentation Checklist tab to check which documents are in place. Prioritise any that are missing.",action:"Identify and organise the documents you would need for an ICO audit."},
      {id:"c7_5",text:"Is there a process for updating this framework when the law changes, when you introduce new systems, or when staff responsibilities change?",guidance:"Your framework should be a living document. Define the specific events that will trigger a review — law changes, new supplier, data breach.",action:"Define the specific events that will trigger a framework review."},
    ]},
  { id:8, name:"Improvement", std:"UK GDPR Arts 5(2), 17, 58(2), 82, 83 · DPA 2018 ss.149, 155, 168 · DUAA 2025 ss.103, 164A · ISO 22301 Cl 10 · EU CRA 2024 Arts 69(3), 71(2)",
    desc:"Close the compliance cycle — ensure gaps lead to action and your framework improves over time.",
    questions:[
      {id:"c8_1",text:"When a problem or gap is identified, is there a written process for fixing it and making sure it does not happen again?",guidance:"A simple corrective action log is sufficient. Document: the issue, action to take, who is responsible, and target date.",action:"Create a corrective action log."},
      {id:"c8_2",text:"After an incident or review, do you formally record what went wrong and update your procedures to prevent it happening again?",guidance:"Record: what happened, the root cause, what changed as a result, and who was responsible. Store alongside your breach register.",action:"Introduce a lessons learned process."},
      {id:"c8_3",text:"Have you checked that your organisation's insurance covers potential claims from people whose personal data has been mishandled?",guidance:"Under UK GDPR Art 82, individuals can claim compensation for harm caused by a data breach. Ask your insurer specifically about this coverage.",action:"Review your insurance cover to confirm it includes data protection liability."},
      {id:"c8_4",text:"Have you set out the specific events that would trigger a review of this framework?",guidance:"Common triggers: a data breach, change in the law, new supplier or system, significant change in data collected, or change in leadership.",action:"Document your framework review triggers."},
    ]},
];

/* ── RISK HEATMAP DATA ────────────────────────────────────────── */
const RISK_AREAS = [
  {id:"lawfulBasis",    label:"Lawful Basis Gaps",      qids:["c1_2","c3_4"],   maxRisk:"Critical", desc:"No documented lawful basis = unlawful processing. ICO can fine up to £17.5m."},
  {id:"specialCat",    label:"Special Category Data",   qids:["c1_3","c3_2","c5_5"], maxRisk:"Critical", desc:"Art 9 data without documented conditions is automatically unlawful."},
  {id:"breachReady",   label:"Breach Readiness",        qids:["c6_1","c6_2","c6_3","c6_4"], maxRisk:"Critical", desc:"Failure to notify ICO within 72 hours can trigger enforcement action."},
  {id:"processorContracts", label:"Processor Contracts",qids:["c4_6","c6_6"],   maxRisk:"High",     desc:"Missing DPAs make you jointly liable for processor breaches."},
  {id:"retention",     label:"Retention Controls",      qids:["c1_4","c4_3"],   maxRisk:"High",     desc:"Keeping data longer than necessary breaches Art 5(1)(e)."},
  {id:"security",      label:"Security Measures",       qids:["c3_1","c5_4"],   maxRisk:"High",     desc:"Inadequate security is the leading cause of ICO fines."},
  {id:"subjectRights", label:"Data Subject Rights",     qids:["c4_4","c4_5","c4_8"], maxRisk:"Medium", desc:"Failing to respond to SARs or erasure requests = enforcement risk."},
  {id:"training",      label:"Staff Awareness",         qids:["c4_7","c6_7"],   maxRisk:"Medium",   desc:"Human error causes most breaches. Untrained staff = preventable incidents."},
];

/* ── TABLETOP SCENARIOS ──────────────────────────────────────── */
const TABLETOP_SCENARIOS = [
  {
    id:"s1", title:"Email Sent to Wrong Recipient",
    severity:"Medium", category:"Disclosure",
    background:"A staff member accidentally sends a list of 45 donor names and email addresses to a supplier contact instead of an internal colleague. The email is not recalled. The supplier acknowledges receipt.",
    inject1:"The supplier says they have forwarded the email to their own marketing team.",
    inject2:"You discover the original email also contained Gift Aid declaration amounts.",
    questions:[
      "Is this a reportable breach? Why?",
      "What containment steps should you take in the first hour?",
      "Does the 72-hour ICO notification clock apply? When did it start?",
      "Do you need to notify the affected individuals?",
      "What changes to procedure would prevent this recurring?",
    ],
    irpSteps:["Step 1: Identify","Step 2: Contain","Step 3: Report internally","Step 4: Assess","Step 5: Notify ICO?","Step 7: Document"],
  },
  {
    id:"s2", title:"Ransomware Attack on Server",
    severity:"Critical", category:"Availability/Confidentiality",
    background:"At 08:15 on a Monday morning, your IT support reports that all files on your shared drive are encrypted. A ransom note demands £3,000 in Bitcoin. The drive contains staff HR files, donor records, and beneficiary case notes including health information.",
    inject1:"Your IT support confirms backups have not been tested in 18 months. The most recent backup is 6 weeks old.",
    inject2:"You receive a call from a local journalist who says they have been contacted by someone claiming to have your beneficiary data.",
    questions:[
      "Who do you call first and in what order?",
      "Does the 72-hour ICO notification apply? At what point did you 'become aware'?",
      "Which data subjects may need to be notified directly, and why?",
      "Do you pay the ransom? What are the legal and ethical considerations?",
      "What immediate actions protect you legally even if you cannot recover the data?",
    ],
    irpSteps:["Step 1: Identify","Step 2: Contain","Step 3: Report internally","Step 4: Assess","Step 5: Notify ICO","Step 6: Notify individuals","Step 7: Document","Step 8: Review"],
  },
  {
    id:"s3", title:"Lost Volunteer Laptop",
    severity:"Medium", category:"Loss",
    background:"A volunteer coordinator reports that their personal laptop — which they used to manage the volunteer rota spreadsheet — has been stolen from their car. The laptop is not encrypted. The spreadsheet contains names, addresses, phone numbers and emergency contacts for 78 volunteers.",
    inject1:"You discover the spreadsheet was also shared via an unprotected Google Drive link.",
    inject2:"One volunteer contacts you to say they have received a suspicious phone call from someone who knew their home address.",
    questions:[
      "Is this a personal data breach? What type?",
      "What is your legal obligation regarding the 72-hour ICO notification?",
      "Should you notify the 78 volunteers? What would you tell them?",
      "What policy failures does this expose?",
      "What immediate controls should you put in place for personal devices?",
    ],
    irpSteps:["Step 1: Identify","Step 2: Contain","Step 3: Report internally","Step 4: Assess","Step 5: Notify ICO?","Step 6: Notify individuals?","Step 7: Document"],
  },
  {
    id:"s4", title:"Unauthorised Access by Former Employee",
    severity:"High", category:"Access Control",
    background:"Your data protection lead discovers that a member of staff who left the organisation six weeks ago has been accessing your donor database using login credentials that were never deactivated. Access logs show 12 logins over four weeks. It is unclear what they viewed or downloaded.",
    inject1:"The former employee has started working for a competitor charity in the same sector.",
    inject2:"You receive a Subject Access Request from the former employee two days later.",
    questions:[
      "What immediate steps do you take in the first 30 minutes?",
      "How do you assess whether this is a reportable breach when you do not know what was accessed?",
      "How does the concurrent SAR affect your response?",
      "What systemic control failure does this reveal?",
      "What evidence do you need to preserve, and why?",
    ],
    irpSteps:["Step 1: Identify","Step 2: Contain","Step 3: Report internally","Step 4: Assess","Step 5: Notify ICO?","Step 7: Document"],
  },
];

/* ── EVIDENCE / APPROVAL METADATA ───────────────────────────── */
// Each question answer can carry: {value, evidenceNote, approvedBy, approvedDate, version}

const DOC_CHECKLIST = [
  {id:"doc1", name:"Personal Data Protection Policy", basis:"UK GDPR Art 24(2)", iso:"Cl 5", guidance:"Draft a written policy covering lawful basis for processing, roles and responsibilities, and what to do in a breach."},
  {id:"doc2", name:"Privacy Notice — donors and public", basis:"UK GDPR Arts 12, 13, 14", iso:"Cls 4 & 7", guidance:"Write a privacy notice in plain English covering: what data you collect, why, how long you keep it, and data subject rights."},
  {id:"doc3", name:"Privacy Notice — staff and volunteers", basis:"UK GDPR Arts 12, 13, 14", iso:"Cls 4 & 7", guidance:"Write a separate notice for staff and volunteers. Provide it when they start. Review annually."},
  {id:"doc4", name:"Data Retention Policy and Schedule", basis:"UK GDPR Arts 5, 13, 17, 30", iso:"Cls 7 & 8", guidance:"Create a schedule stating how long each type of data is kept and when it is deleted."},
  {id:"doc5", name:"Article 30 Record of Processing Activities", basis:"UK GDPR Art 30", iso:"Cl 7", guidance:"Create a RoPA listing all data types, purposes, lawful basis, recipients, retention periods and security measures."},
  {id:"doc6", name:"Data Subject Consent Form", basis:"UK GDPR Arts 6, 7, 9", iso:"Cl 6", guidance:"Confirm whether consent forms are in use for donor marketing. Where consent is used, ensure it is freely given, specific and documented."},
  {id:"doc7", name:"DPIA Register", basis:"UK GDPR Art 35", iso:"Cl 8.2", guidance:"Carry out DPIAs for high-risk processing: CCTV, health data, large-scale processing, new technology."},
  {id:"doc8", name:"Data Processing Agreement — EPOS/till provider", basis:"UK GDPR Arts 28, 32, 82", iso:"Cls 7 & 8", guidance:"Your EPOS/till provider processes transaction data on your behalf. A written DPA is legally required."},
  {id:"doc9", name:"Data Processing Agreement — IT support provider", basis:"UK GDPR Arts 28, 32, 82", iso:"Cls 7 & 8", guidance:"Your IT support remotely accesses devices containing personal data. A written DPA is legally required."},
  {id:"doc10",name:"Data Breach Response and Notification Procedure", basis:"UK GDPR Arts 4, 33, 34", iso:"Cl 8.4", guidance:"See the Incident Response Plan tab for a ready-made procedure template you can complete and print."},
  {id:"doc11",name:"Data Breach Register", basis:"UK GDPR Art 33(5)", iso:"Cl 8.4", guidance:"Create a simple register to log all incidents — including those not reported to the ICO."},
  {id:"doc12",name:"ICO Breach Notification Template", basis:"UK GDPR Art 33", iso:"Cl 8.4", guidance:"Prepare a template using the ICO breach report format so the 72-hour deadline can be met efficiently."},
  {id:"doc13",name:"Individual Notification Template", basis:"UK GDPR Art 34", iso:"Cl 8.4", guidance:"Prepare a plain English template for writing to individuals affected by a high-risk breach."},
  {id:"doc14",name:"Incident Response Roles and Responsibilities", basis:"ISO 22301 Cl 5; UK GDPR Arts 5(2), 24(1)", iso:"Cl 5", guidance:"Document who is responsible for incident response and what their role is. Include backup contacts."},
  {id:"doc15",name:"Data Subject Complaint Procedure", basis:"DUAA 2025 ss.103, 164A", iso:"Cl 7", guidance:"Create a complaint handling process with a commitment to acknowledge within 30 days."},
];

const RETENTION = [
  {id:"r1a",ref:"R.1.a",name:"Accident books and accident records / reports",stat:"3 years",note:"Employers' Liability (Compulsory Insurance) Act 1969"},
  {id:"r1b",ref:"R.1.b",name:"Accounting records",stat:"3 years (companies); 6 years (charities)",note:"Companies Act 2006; Charities Act 2011"},
  {id:"r1c",ref:"R.1.c",name:"Employee personnel records",stat:"6 years after employment ends",note:"Employment Rights Act 1996; Limitation Act 1980"},
  {id:"r1d",ref:"R.1.d",name:"First aid training records",stat:"6 years after employment ends",note:"Health & Safety (First Aid) Regulations 1981"},
  {id:"r1e",ref:"R.1.e",name:"Fire warden / H&S training records",stat:"5 years after employment ends",note:"Regulatory Reform (Fire Safety) Order 2005"},
  {id:"r1f",ref:"R.1.f",name:"Health & Safety representatives training",stat:"5 years after employment ends",note:"Safety Representatives Regulations 1977"},
  {id:"r1g",ref:"R.1.g",name:"Income tax and NI returns / HMRC correspondence",stat:"3 years after fiscal year end",note:"Income Tax (PAYE) Regulations 2003"},
  {id:"r1h",ref:"R.1.h",name:"National minimum wage records",stat:"3 years from last pay date",note:"National Minimum Wage Act 1998"},
  {id:"r1i",ref:"R.1.i",name:"Payroll / wage records (incl. overtime, bonuses)",stat:"6 years from year they relate",note:"PAYE Regulations; Limitation Act 1980"},
  {id:"r1j",ref:"R.1.j",name:"Records relating to children and young adults",stat:"Until the child reaches age 21",note:"Children Act 1989"},
  {id:"r1k",ref:"R.1.k",name:"Retirement benefit scheme records",stat:"6 years from scheme year end",note:"Occupational Pension Schemes Regs 1996"},
  {id:"r1l",ref:"R.1.l",name:"Statutory maternity / paternity / adoption pay",stat:"3 years after the tax year",note:"Social Security Administration Act 1992"},
  {id:"r1m",ref:"R.1.m",name:"Subject access request (SAR) records",stat:"1 year following completion",note:"UK GDPR Art 12; ICO guidance"},
  {id:"r1n",ref:"R.1.n",name:"VAT records (incl. COVID deferral)",stat:"6 years",note:"Value Added Tax Act 1994"},
  {id:"r1o",ref:"R.1.o",name:"Whistleblowing documents",stat:"6 months",note:"Public Interest Disclosure Act 1998; ICO guidance"},
  {id:"r1p",ref:"R.1.p",name:"Working time records (annual leave, overtime)",stat:"2 years from creation",note:"Working Time Regulations 1998"},
  {id:"r2a",ref:"R.2.a",name:"Beneficiary personal data",stat:"7 years",note:"Charities Act 2011; ICO charity guidance"},
  {id:"r2b",ref:"R.2.b",name:"DBS / criminal records checks",stat:"5 years after employment ends",note:"ICO guidance; Rehabilitation of Offenders Act 1974"},
  {id:"r2c",ref:"R.2.c",name:"Marketing consent and recipient lists",stat:"6 months from campaign end",note:"PECR; UK GDPR Art 7; ICO PECR guidance"},
  {id:"r2d",ref:"R.2.d",name:"Recruitment application forms",stat:"6 months",note:"Equality Act 2010; ICO employment guidance"},
  {id:"r2e",ref:"R.2.e",name:"Referee / reference contact data",stat:"1 year after reference made",note:"UK GDPR Art 5(1)(e); ICO guidance"},
  {id:"r2f",ref:"R.2.f",name:"Right to work verification",stat:"2 years",note:"Immigration Act 2014; Home Office guidance"},
  {id:"r2g",ref:"R.2.g",name:"Sickness pay and absence records",stat:"6 years",note:"Employment Rights Act 1996; Limitation Act 1980"},
  {id:"r2h",ref:"R.2.h",name:"Trustee personal data",stat:"Permanently",note:"Charities Act 2011 — charity governance records"},
  {id:"r2i",ref:"R.2.i",name:"Volunteer personal data",stat:"1 year after leaving",note:"UK GDPR Art 5(1)(e); data minimisation principle"},
  {id:"r2j",ref:"R.2.j",name:"Donor personal data and gift records",stat:"3 years after last donation",note:"Charities Act 2011; Gift Aid regulations"},
  {id:"r2k",ref:"R.2.k",name:"Practitioner / contractor data",stat:"5 years after last contract",note:"Limitation Act 1980; ICO guidance"},
  {id:"r2l",ref:"R.2.l",name:"Legacy / will-related data",stat:"2 years after donor's death",note:"Limitation Act 1980; ICO guidance"},
  {id:"r2m",ref:"R.2.m",name:"SAR request log",stat:"1 year following request",note:"UK GDPR Art 12; ICO guidance"},
  {id:"r2n",ref:"R.2.n",name:"Data breach register entries",stat:"Minimum 3 years",note:"UK GDPR Art 33(5); ICO guidance"},
  {id:"r2o",ref:"R.2.o",name:"CCTV footage",stat:"31 days (review regularly)",note:"CCTV Code of Practice (ICO); UK GDPR Art 5(1)(e)"},
  {id:"r2p",ref:"R.2.p",name:"Website / email analytics data",stat:"26 months maximum",note:"PECR; ICO analytics guidance; UK GDPR Art 5"},
];

const appStorage = {
  async get(key) {
    if (window.storage?.get) {
      return window.storage.get(key);
    }
    const value = window.localStorage.getItem(key);
    return value === null ? {} : { value };
  },
  async set(key, value) {
    if (window.storage?.set) {
      return window.storage.set(key, value);
    }
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
};

const DPIA_STEPS = [
  {step:1, title:"Identify the need for a DPIA", guidance:"Name the project or processing activity. Explain why a DPIA is needed — which high-risk trigger applies? Common triggers: processing health or biometric data, large-scale profiling, systematic monitoring, processing children's data, CCTV."},
  {step:2, title:"Describe the processing — nature", guidance:"How will personal data be collected, used, stored and deleted? What is the source of the data? Will data be shared with any third parties? Include a flow diagram or description of the data lifecycle."},
  {step:3, title:"Describe the processing — scope, context and purpose", guidance:"What is the nature of the personal data? Does it include special category or criminal offence data? How much data will be collected and how often? How long will it be retained? What is the purpose of the processing?"},
  {step:4, title:"Assess necessity and proportionality", guidance:"Is the processing necessary for your stated purpose? Could the same outcome be achieved with less data or less intrusive processing? What is the lawful basis? If special category data, what is the Art 9(2) condition?"},
  {step:5, title:"Identify and assess risks to individuals", guidance:"Identify the potential risks to data subjects from this processing. For each risk, assess: (a) the likelihood of the risk occurring; (b) the severity of harm if it does. Rate the overall risk level as Low, Medium or High."},
  {step:6, title:"Identify measures to mitigate risks", guidance:"For each risk identified in Step 5, document: (a) the measure taken to reduce the likelihood or severity of harm; (b) the residual risk after the measure is applied; (c) whether the residual risk is acceptable."},
  {step:7, title:"Sign-off and outcomes", guidance:"Document who has reviewed and approved this DPIA. If the residual risk is high and cannot be adequately mitigated, consult the ICO before proceeding. Record: DPO consultation if applicable, approval date, conditions attached, and next review date."},
];

const IRP_STEPS = [
  {step:1, action:"Identify the incident", detail:"Recognise that something has gone wrong. A personal data breach is any incident involving accidental or unlawful access to, loss of, or disclosure of personal data — even if no harm results.", timeframe:"Immediately", legal:"UK GDPR Art 4(12)"},
  {step:2, action:"Contain the issue", detail:"Take immediate steps to limit further damage. Examples: change compromised passwords, retrieve misdirected emails, secure physical records, isolate affected systems, revoke unauthorised access.", timeframe:"Immediately", legal:"UK GDPR Art 32"},
  {step:3, action:"Report internally", detail:"Inform the named Incident Lead as soon as possible. Do not attempt to assess or resolve the incident without informing the lead first.", timeframe:"Within the same working day", legal:"UK GDPR Art 5(2)"},
  {step:4, action:"Assess whether it is a personal data breach", detail:"The Incident Lead must assess: Was personal data involved? How many individuals are affected? Is there a risk to their rights and freedoms? This assessment starts the 72-hour ICO notification clock.", timeframe:"Within 24 hours of becoming aware", legal:"UK GDPR Art 33(1)"},
  {step:5, action:"Notify the ICO if required", detail:"If the breach is likely to result in risk to individuals, notify the ICO within 72 hours. Report at ico.org.uk. If notification is delayed beyond 72 hours, document the reasons for the delay.", timeframe:"Within 72 hours — this is a legal deadline", legal:"UK GDPR Art 33(1)(3)"},
  {step:6, action:"Notify affected individuals if required", detail:"If the breach is likely to result in HIGH risk to individuals — for example, payment card data or health information has been exposed — notify affected individuals directly without undue delay.", timeframe:"Without undue delay once high risk is confirmed", legal:"UK GDPR Art 34"},
  {step:7, action:"Document the incident", detail:"Record the incident in your Data Breach Register regardless of whether it was reported to the ICO. Include: date, description, data involved, number of individuals affected, and actions taken.", timeframe:"Within 24 hours of the incident being assessed", legal:"UK GDPR Art 33(5)"},
  {step:8, action:"Review and improve", detail:"After the incident is resolved, review what happened: What was the root cause? What could have prevented it? What needs to change? Update this plan and the Action Tracker with lessons learned.", timeframe:"Within two weeks of the incident being resolved", legal:"ISO 22301 Cl 10; UK GDPR Art 5(2)"},
];

const KEY_CONTACTS_ROLES = [
  {id:"kc1", role:"Named Data Protection Lead\n(assign in Phase 2)", notes:"First point of contact for all data protection matters and breach reports."},
  {id:"kc2", role:"Backup Data Protection Contact", notes:"Second point of contact if the named lead is unavailable."},
  {id:"kc3", role:"EPOS / Till Provider", notes:"Contact for all issues with the till system. Report to Incident Lead before calling."},
  {id:"kc4", role:"IT Support Provider", notes:"Contact for all issues with laptops, email and the shared drive."},
  {id:"kc5", role:"Card Payment Provider", notes:"Contact for all card payment issues. Report card data breaches to Incident Lead immediately."},
];

const PROCESSOR_TYPES = [
  {id:"pr1", type:"EPOS / Till provider"},
  {id:"pr2", type:"IT support provider"},
  {id:"pr3", type:"Card payment processor"},
  {id:"pr4", type:"Email marketing platform"},
  {id:"pr5", type:"Payroll bureau"},
  {id:"pr6", type:"Cloud storage (e.g. Google Drive, OneDrive)"},
  {id:"pr7", type:"DBS check provider"},
  {id:"pr8", type:"Other processor"},
];

const ACTION_ITEMS = [
  {code:"CTX-1",phase:"Phase 1: Context",desc:"Know what personal data your charity collects",qid:"c1_1",priority:"High"},
  {code:"CTX-2",phase:"Phase 1: Context",desc:"Written record of legal reason (lawful basis) for collecting each data type",qid:"c1_2",priority:"High"},
  {code:"CTX-3",phase:"Phase 1: Context",desc:"Identified whether you collect special category / sensitive data",qid:"c1_3",priority:"High"},
  {code:"CTX-4",phase:"Phase 1: Context",desc:"Record of Processing Activities (RoPA) / Article 30 register",qid:"c1_4",priority:"High"},
  {code:"CTX-5",phase:"Phase 1: Context",desc:"All third-party data processors identified",qid:"c1_5",priority:"High"},
  {code:"CTX-6",phase:"Phase 1: Context",desc:"Privacy notices in place for donors/public AND staff/volunteers",qid:"c1_6",priority:"High"},
  {code:"LDR-1",phase:"Phase 2: Leadership",desc:"Named person responsible for data protection",qid:"c2_1",priority:"High"},
  {code:"LDR-2",phase:"Phase 2: Leadership",desc:"Written data protection policy in place",qid:"c2_2",priority:"High"},
  {code:"LDR-3",phase:"Phase 2: Leadership",desc:"Policy reviewed and approved by trustees/management",qid:"c2_3",priority:"Medium"},
  {code:"LDR-4",phase:"Phase 2: Leadership",desc:"Checked whether a Data Protection Officer (DPO) is required",qid:"c2_4",priority:"High"},
  {code:"LDR-5",phase:"Phase 2: Leadership",desc:"All staff/volunteers know who to contact about data protection",qid:"c2_5",priority:"Medium"},
  {code:"PLN-1",phase:"Phase 3: Planning",desc:"Formal data protection risk assessment carried out",qid:"c3_1",priority:"High"},
  {code:"PLN-2",phase:"Phase 3: Planning",desc:"DPIA completed for high-risk processing activities",qid:"c3_2",priority:"High"},
  {code:"PLN-3",phase:"Phase 3: Planning",desc:"Privacy by design checks before new systems/processes",qid:"c3_3",priority:"Medium"},
  {code:"PLN-4",phase:"Phase 3: Planning",desc:"Consent records documented where processing relies on consent",qid:"c3_4",priority:"High"},
  {code:"PLN-5",phase:"Phase 3: Planning",desc:"CCTV privacy notice displayed and DPIA completed (if applicable)",qid:"c3_5",priority:"Medium"},
  {code:"PLN-6",phase:"Phase 3: Planning",desc:"PCI DSS compliance confirmed with card payment provider (if applicable)",qid:"c3_6",priority:"Medium"},
  {code:"SUP-1",phase:"Phase 4: Support",desc:"Public/donor privacy notice in place",qid:"c4_1",priority:"High"},
  {code:"SUP-2",phase:"Phase 4: Support",desc:"Staff and volunteer privacy notice in place",qid:"c4_2",priority:"High"},
  {code:"SUP-3",phase:"Phase 4: Support",desc:"Up-to-date Record of Processing Activities (RoPA)",qid:"c4_3",priority:"High"},
  {code:"SUP-4",phase:"Phase 4: Support",desc:"Written Subject Access Request (SAR) process — respond within 1 month",qid:"c4_4",priority:"High"},
  {code:"SUP-5",phase:"Phase 4: Support",desc:"Erasure/deletion process and processor notification procedure",qid:"c4_5",priority:"Medium"},
  {code:"SUP-6",phase:"Phase 4: Support",desc:"Signed Data Processing Agreement (DPA) with every third-party processor",qid:"c4_6",priority:"High"},
  {code:"SUP-7",phase:"Phase 4: Support",desc:"All staff and volunteers trained on data protection and breach reporting",qid:"c4_7",priority:"High"},
  {code:"SUP-8",phase:"Phase 4: Support",desc:"Complaint handling process — acknowledge within 30 days (DUAA 2025)",qid:"c4_8",priority:"High"},
  {code:"BIA-1",phase:"Phase 5: BIA",desc:"Critical activities identified and documented",qid:"c5_1",priority:"Medium"},
  {code:"BIA-2",phase:"Phase 5: BIA",desc:"Recovery Time Objectives (RTOs) set for each critical activity",qid:"c5_3",priority:"Medium"},
  {code:"BIA-3",phase:"Phase 5: BIA",desc:"Backup arrangements documented in writing",qid:"c5_4",priority:"Medium"},
  {code:"BIA-4",phase:"Phase 5: BIA",desc:"DPIA completed for critical data processing activities",qid:"c5_5",priority:"High"},
  {code:"BIA-5",phase:"Phase 5: BIA",desc:"Impact on data subjects assessed if systems fail or data is exposed",qid:"c5_6",priority:"Medium"},
  {code:"IR-1",phase:"Phase 6: Incident Response",desc:"Named Incident Lead assigned (available when manager absent)",qid:"c6_1",priority:"Critical"},
  {code:"IR-2",phase:"Phase 6: Incident Response",desc:"Written step-by-step incident response procedure",qid:"c6_2",priority:"Critical"},
  {code:"IR-3",phase:"Phase 6: Incident Response",desc:"Data breach register maintained for ALL incidents",qid:"c6_3",priority:"Critical"},
  {code:"IR-4",phase:"Phase 6: Incident Response",desc:"ICO notification template prepared for 72-hour deadline",qid:"c6_4",priority:"Critical"},
  {code:"IR-5",phase:"Phase 6: Incident Response",desc:"Individual notification template (plain English) prepared",qid:"c6_5",priority:"High"},
  {code:"IR-6",phase:"Phase 6: Incident Response",desc:"Supplier contracts include data breach notification obligation",qid:"c6_6",priority:"High"},
  {code:"IR-7",phase:"Phase 6: Incident Response",desc:"All staff/volunteers briefed on what a breach looks like",qid:"c6_7",priority:"High"},
  {code:"IR-8",phase:"Phase 6: Incident Response",desc:"Process for receiving security alerts from IT suppliers",qid:"c6_8",priority:"Medium"},
  {code:"PER-1",phase:"Phase 7: Performance",desc:"Annual framework review date scheduled",qid:"c7_1",priority:"Medium"},
  {code:"PER-2",phase:"Phase 7: Performance",desc:"Tabletop exercise / breach simulation practised",qid:"c7_2",priority:"Medium"},
  {code:"PER-3",phase:"Phase 7: Performance",desc:"Data protection performance metrics tracked",qid:"c7_3",priority:"Medium"},
  {code:"PER-4",phase:"Phase 7: Performance",desc:"ICO audit documents identified and organised",qid:"c7_4",priority:"Medium"},
  {code:"PER-5",phase:"Phase 7: Performance",desc:"Process for updating framework on law/system changes",qid:"c7_5",priority:"Medium"},
  {code:"IMP-1",phase:"Phase 8: Improvement",desc:"Written corrective action process in place",qid:"c8_1",priority:"Medium"},
  {code:"IMP-2",phase:"Phase 8: Improvement",desc:"Lessons learned process after every incident",qid:"c8_2",priority:"Medium"},
  {code:"IMP-3",phase:"Phase 8: Improvement",desc:"Insurance covers data protection liability (UK GDPR Art 82)",qid:"c8_3",priority:"Medium"},
  {code:"IMP-4",phase:"Phase 8: Improvement",desc:"Framework review triggers defined and documented",qid:"c8_4",priority:"Medium"},
];

const DEFINITIONS = [
  /* ── Framework legislation ── */
  {term:"UK GDPR",         cat:"Legislation", meaning:"The principal data protection law in the United Kingdom following Brexit, retained from the EU GDPR. Applies to all organisations processing personal data about people in the UK. Maximum fines of £17.5 million or 4% of global annual turnover, whichever is higher.",ref:"UK GDPR (retained from EU Reg 2016/679) — in force 1 January 2021"},
  {term:"DPA 2018",        cat:"Legislation", meaning:"The Data Protection Act 2018 supplements UK GDPR, providing specific conditions and exemptions for UK law. It creates additional lawful bases and special category conditions, including schedules for employment, health, safeguarding and research.",ref:"Data Protection Act 2018 — read alongside UK GDPR"},
  {term:"DUAA 2025",       cat:"Legislation", meaning:"The Data (Use and Access) Act 2025, which updates the UK data protection framework. Key provisions include updated complaint-handling obligations requiring acknowledgement within 30 days and changes to digital records access.",ref:"DUAA 2025 ss.92, 101, 103, 164A"},
  {term:"EU CRA 2024",     cat:"Legislation", meaning:"EU Regulation 2024/2847 (Cyber Resilience Act). Requires manufacturers of digital products (hardware and software) to meet cybersecurity standards and notify users of security incidents. Applies from September 2026; full enforcement December 2027. Relevant where your charity purchases digital products from EU suppliers.",ref:"EU CRA 2024 Art 14 — incident notification obligations"},
  {term:"ISO 22301",       cat:"Legislation", meaning:"The international standard for Business Continuity Management Systems (BCMS). Provides the structural framework for Phases 1–8 of this tool, covering context, leadership, planning, support, operation, performance evaluation and improvement.",ref:"ISO 22301:2019 — Business Continuity Management"},
  {term:"PECR",            cat:"Legislation", meaning:"Privacy and Electronic Communications Regulations 2003. Governs electronic marketing, cookies, and use of electronic communications. Requires consent for most marketing emails and affirmative opt-in for non-essential cookies.",ref:"PECR 2003 — implements EU ePrivacy Directive in UK law"},
  /* ── Core concepts ── */
  {term:"Personal data",   cat:"Core concept", meaning:"Any information that identifies or could identify a living individual — directly or indirectly. Includes names, email addresses, phone numbers, IP addresses, photos, payroll numbers, and any combination of information that singles someone out.",ref:"UK GDPR Art 4(1)"},
  {term:"Processing",      cat:"Core concept", meaning:"Any operation performed on personal data — collecting, recording, organising, storing, adapting, retrieving, sharing, combining, restricting, erasing or destroying it. Almost everything your charity does with personal data is 'processing'.",ref:"UK GDPR Art 4(2)"},
  {term:"Data controller", cat:"Core concept", meaning:"The organisation that determines the purposes and means of processing personal data. Your charity is the data controller for all personal data it holds about donors, volunteers, beneficiaries and staff. The controller is legally responsible for demonstrating compliance.",ref:"UK GDPR Art 4(7) — accountability principle Art 5(2)"},
  {term:"Data processor",  cat:"Core concept", meaning:"A third party that processes personal data solely on behalf of and under the instruction of the data controller. Examples: payroll bureau, EPOS till provider, IT support, cloud storage, email marketing platform. A written Data Processing Agreement is required with every processor.",ref:"UK GDPR Art 4(8) — processor obligations Art 28"},
  {term:"Lawful basis",    cat:"Core concept", meaning:"The legal justification for processing personal data. One of six bases must apply and be documented before collection begins: (1) Consent, (2) Contract, (3) Legal obligation, (4) Vital interests, (5) Public task, (6) Legitimate interests. Choosing the wrong basis or having none is unlawful.",ref:"UK GDPR Art 6 — basis must be identified before processing begins"},
  {term:"Special category data", cat:"Core concept", meaning:"Eight categories of personal data requiring extra legal protection: (1) health data, (2) racial or ethnic origin, (3) political opinions, (4) religious or philosophical beliefs, (5) trade union membership, (6) genetic data, (7) biometric data used for identification, (8) sex life or sexual orientation. Requires both an Art 6 lawful basis AND a separate Art 9(2) condition.",ref:"UK GDPR Art 9 — processing is prohibited unless a condition applies"},
  {term:"Art 9(2) condition", cat:"Core concept", meaning:"One of ten additional legal conditions required to process special category data, over and above the Art 6 lawful basis. Examples include: (a) explicit consent, (b) employment/social protection obligations, (c) vital interests, (h) health or social care, (j) research. Must be documented for each type of special category data processed.",ref:"UK GDPR Art 9(2) — DPA 2018 Sch 1 provides UK-specific conditions"},
  {term:"Criminal offence data", cat:"Core concept", meaning:"Data relating to criminal convictions, offences or related security measures. Treated similarly to special category data and subject to strict additional conditions under DPA 2018. Includes DBS check results.",ref:"UK GDPR Art 10 — DPA 2018 s.10 and Sch 1"},
  /* ── Key documents ── */
  {term:"Article 30 RoPA", cat:"Key document", meaning:"Record of Processing Activities — a document every controller with 250+ employees must maintain (smaller organisations are strongly advised to as well). Must list: data types, purposes, lawful basis, data subjects, recipients, retention periods, security measures and third-country transfers.",ref:"UK GDPR Art 30 — must be made available to ICO on request"},
  {term:"Data Processing Agreement (DPA)", cat:"Key document", meaning:"A mandatory written contract between a data controller and every processor, covering the subject matter, duration, nature and purpose of processing, type of personal data, categories of data subjects, and obligations and rights of the controller. Must be in place before the processor handles any personal data.",ref:"UK GDPR Art 28(3) — failure to have a DPA is an Art 83 violation"},
  {term:"Privacy notice",  cat:"Key document", meaning:"A document provided to individuals at the point their data is collected, explaining what data is collected, why, the lawful basis, how long it is kept, who it is shared with, and their data subject rights. Must be concise, transparent, intelligible and in plain language.",ref:"UK GDPR Arts 12, 13, 14 — different rules apply for directly and indirectly collected data"},
  {term:"DPIA",            cat:"Key document", meaning:"Data Protection Impact Assessment — a structured risk assessment required by law before any processing likely to result in high risk to individuals. Mandatory for: systematic profiling, large-scale special category data, systematic public monitoring (including CCTV), biometric data, children's data, and new technologies.",ref:"UK GDPR Art 35 — ICO publishes a screening checklist and template"},
  {term:"Data Retention Policy", cat:"Key document", meaning:"A policy and schedule specifying how long each category of personal data is kept and the criteria used to determine retention periods. Keeping data longer than necessary breaches the storage limitation principle. Statutory minimum periods take precedence; after those periods, data should be reviewed and deleted.",ref:"UK GDPR Art 5(1)(e) — storage limitation principle"},
  /* ── Roles ── */
  {term:"DPO",             cat:"Role", meaning:"Data Protection Officer — a mandatory role for organisations whose core activities involve large-scale processing of special category data or systematic monitoring of individuals. Most small charities do not require a formal DPO but must document their assessment. The DPO must be independent, expert, and report directly to senior management.",ref:"UK GDPR Arts 37–39 — DPO cannot be instructed in exercise of their tasks"},
  {term:"Data protection lead", cat:"Role", meaning:"A named individual responsible for data protection matters within an organisation — not a formal DPO unless required. Should be the first point of contact for staff reporting concerns, the named contact in breach reports, and responsible for annual framework reviews. Required by this framework in Phase 2.",ref:"UK GDPR Art 24(1) — accountability; ISO 22301 Cl 5.3"},
  {term:"ICO",             cat:"Role", meaning:"Information Commissioner's Office — the UK's independent data protection regulator and supervisory authority. All organisations that process personal data must register with the ICO (unless exempt). The ICO can issue fines, enforcement notices, reprimands and audit requests. Report qualifying breaches within 72 hours.",ref:"UK GDPR Arts 57, 58, 83 — ICO registration required under DPA 2018 s.137"},
  /* ── Data subject rights ── */
  {term:"SAR",             cat:"Data subject right", meaning:"Subject Access Request — a request by an individual for a copy of all personal data an organisation holds about them, together with supplementary information. Must be responded to within one calendar month, free of charge. Extensions of up to two further months allowed for complex or numerous requests.",ref:"UK GDPR Art 15 — right of access; response deadline Art 12(3)"},
  {term:"Right to erasure", cat:"Data subject right", meaning:"Also called the 'right to be forgotten'. Individuals can request deletion of their personal data in specific circumstances — for example if consent is withdrawn, the data is no longer necessary, or it was processed unlawfully. You must also inform any processors to delete the data.",ref:"UK GDPR Art 17 — right to erasure ('right to be forgotten')"},
  {term:"Right to rectification", cat:"Data subject right", meaning:"Individuals can request correction of inaccurate personal data or completion of incomplete data. Must be responded to within one calendar month. You must also inform any third parties who received the inaccurate data.",ref:"UK GDPR Art 16 — right to rectification"},
  {term:"Right to object", cat:"Data subject right", meaning:"Individuals can object to processing based on legitimate interests or for direct marketing purposes. For direct marketing, the right is absolute and you must stop immediately. For other purposes, you must stop unless you can demonstrate compelling legitimate grounds that override the individual's interests.",ref:"UK GDPR Art 21 — right to object"},
  {term:"Right to restrict processing", cat:"Data subject right", meaning:"Individuals can request that you restrict processing of their data in specific circumstances — for example while the accuracy of data is contested or an objection is being considered. Restricted data can be stored but not used.",ref:"UK GDPR Art 18 — right to restriction of processing"},
  {term:"Right to data portability", cat:"Data subject right", meaning:"Individuals can request their personal data in a structured, commonly used, machine-readable format to transfer to another organisation. Applies only where processing is based on consent or contract and is carried out by automated means.",ref:"UK GDPR Art 20 — right to data portability"},
  /* ── Incidents ── */
  {term:"Personal data breach", cat:"Incident", meaning:"A security incident resulting in the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data. Includes misdirected emails, lost devices, ransomware, and unauthorised access by staff. All breaches must be documented. Breaches likely to risk individuals' rights must be reported to ICO within 72 hours.",ref:"UK GDPR Arts 4(12), 33(5) — documentation requirement"},
  {term:"72-hour rule",    cat:"Incident", meaning:"The legal deadline for notifying the ICO of a personal data breach that is likely to result in a risk to individuals' rights and freedoms. The clock starts from the moment the controller becomes aware — not when the breach occurred. Delays beyond 72 hours must be explained and justified in the notification.",ref:"UK GDPR Art 33(1) — fines under Art 83 for failure to notify"},
  {term:"High risk breach", cat:"Incident", meaning:"A breach that is likely to result in high risk to individuals' rights and freedoms — for example exposure of health data, financial data, or data enabling identity theft. High risk breaches require both ICO notification within 72 hours AND direct notification to affected individuals without undue delay.",ref:"UK GDPR Art 34 — individual notification requirement"},
  /* ── Security ── */
  {term:"Privacy by design", cat:"Security", meaning:"The principle that data protection should be built into systems, products and processes from the outset rather than added as an afterthought. Controllers must implement appropriate technical and organisational measures at the design stage of any new processing activity.",ref:"UK GDPR Art 25 — data protection by design and by default"},
  {term:"Data minimisation", cat:"Security", meaning:"One of the six data protection principles. Personal data must be adequate, relevant and limited to what is necessary for the stated purpose. You should not collect more data than you need, and should not retain it longer than necessary.",ref:"UK GDPR Art 5(1)(c) — data minimisation principle"},
  {term:"PCI DSS",         cat:"Security", meaning:"Payment Card Industry Data Security Standard. A set of security requirements for organisations that process card payments, mandated by card payment networks. Your EPOS and card payment providers can confirm your compliance status. Non-compliance can result in losing the ability to accept card payments.",ref:"PCI DSS v4.0 — administered by the PCI Security Standards Council"},
  {term:"BCM",             cat:"Security", meaning:"Business Continuity Management — the discipline of identifying critical activities and ensuring an organisation can continue operating and protect personal data during and after a disruption. ISO 22301 provides the international standard for BCM and structures Phases 1–8 of this framework.",ref:"ISO 22301:2019 — structured approach to organisational resilience"},
  {term:"RTO",             cat:"Security", meaning:"Recovery Time Objective — the maximum acceptable time within which a system, application or critical activity must be restored after a disruption. Setting RTOs for each critical activity (Phase 5) ensures your team knows which systems to restore first and within what timeframe.",ref:"ISO 22301 Cl 8.2 — business impact analysis"},
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const OPTS = [
  {value:"yes",label:"Yes",cls:"opt-yes"},
  {value:"in_progress",label:"In progress",cls:"opt-prog"},
  {value:"no",label:"No",cls:"opt-no"},
  {value:"not_applicable",label:"Not applicable",cls:"opt-na"},
];

function phaseScore(phase, answers) {
  const answered = phase.questions.filter(q=>answers[q.id]?.value||answers[q.id]).length;
  const applicable = phase.questions.filter(q=>{const v=answers[q.id]?.value||answers[q.id]; return v&&v!=="not_applicable";});
  const complete = applicable.filter(q=>{const v=answers[q.id]?.value||answers[q.id]; return v==="yes";}).length;
  const pct = applicable.length>0?Math.round((complete/applicable.length)*100):0;
  return {total:phase.questions.length,answered,applicable:applicable.length,complete,pct};
}

function overallScore(answers) {
  let totalA=0,totalC=0,totalAnswered=0;
  PHASES.forEach(p=>p.questions.forEach(q=>{
    const v=answers[q.id]?.value||answers[q.id];
    if(v) totalAnswered++;
    if(v&&v!=="not_applicable"){totalA++;if(v==="yes") totalC++;}
  }));
  return {pct:totalA>0?Math.round((totalC/totalA)*100):0,answered:totalAnswered,total:PHASES.reduce((s,p)=>s+p.questions.length,0),complete:totalC,applicable:totalA};
}

function getAnsValue(answers, qid) {
  const a = answers[qid];
  if(!a) return null;
  return typeof a === "object" ? a.value : a;
}

function allPhaseQuestionsAnswered(answers) {
  return PHASES.every(phase => phase.questions.every(q => getAnsValue(answers, q.id)));
}

function isToolView(view) {
  return [
    "doc-checklist","retention","data-register","dpia","irp",
    "key-contacts","action-tracker","breach-register","scenario-sim",
    "compliance-report"
  ].includes(view);
}

function tier(pct, answered) {
  if(answered===0) return {label:"Not started",icon:"—",fg:"#6b7280",bg:"#f9fafb",border:"#e5e7eb"};
  if(pct>=80) return {label:"Compliant",icon:"✓",fg:"#15803d",bg:"#f0fdf4",border:"#86efac"};
  if(pct>=40) return {label:"Partially Compliant",icon:"◑",fg:"#b45309",bg:"#fffbeb",border:"#fde68a"};
  return {label:"Non-Compliant",icon:"⚠",fg:"#b91c1c",bg:"#fef2f2",border:"#fca5a5"};
}

function arcColor(pct) {
  if(pct>=80) return "#15803d";
  if(pct>=40) return "#f59e0b";
  if(pct>0)   return "#ef4444";
  return "#d1d5db";
}

function riskScore(area, answers) {
  const vals = area.qids.map(qid=>getAnsValue(answers,qid));
  const answered = vals.filter(v=>v&&v!=="not_applicable").length;
  if(answered===0) return {level:"Unknown",color:"#9ca3af",bg:"#f9fafb"};
  const nos = vals.filter(v=>v==="no").length;
  const progs = vals.filter(v=>v==="in_progress").length;
  const score = nos*2 + progs*1;
  const max = area.qids.length*2;
  const pct = score/max;
  if(pct>=0.5) return {level:area.maxRisk==="Critical"?"Critical":"High",color:"#b91c1c",bg:"#fef2f2"};
  if(pct>=0.25) return {level:"Medium",color:"#b45309",bg:"#fffbeb"};
  return {level:"Low",color:"#15803d",bg:"#f0fdf4"};
}

function Ring({pct,size=48,stroke=4}) {
  const r=(size-stroke)/2,circ=2*Math.PI*r,dash=(pct/100)*circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ece9e4" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={arcColor(pct)} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.5s ease"}}/>
    </svg>
  );
}

function ToolNav({current, onNav}) {
  return (
    <div className="tool-nav-bar no-print">
      {[
        ["doc-checklist","Doc Checklist"],["retention","Retention"],
        ["data-register","Data Register"],["dpia","DPIA"],
        ["irp","IRP"],["key-contacts","Key Contacts"],
        ["action-tracker","Actions"],["breach-register","Breaches"],
        ["scenario-sim","Scenarios"],
      ].map(([v,label])=>(
        <button key={v} className={`tool-nav-btn ${current===v?"active":""}`} onClick={()=>onNav(v)}>{label}</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
:root{
  --bg:#f5f4f0;--card:#fff;--b:#e0ddd8;--b2:#ece9e4;
  --t1:#1a1a1a;--t2:#55524e;--t3:#8a8680;--sw:264px;
  --serif:'Instrument Serif',Georgia,serif;
  --sans:'DM Sans',system-ui,sans-serif;
  --mono:'DM Mono',monospace;
  --red:#b91c1c;--amber:#b45309;--green:#15803d;
}
.app{display:flex;height:100vh;background:var(--bg);font-family:var(--sans);color:var(--t1);overflow:hidden}

/* ── SIDEBAR ── */
.sb{width:var(--sw);min-width:var(--sw);background:var(--card);border-right:1px solid var(--b);display:flex;flex-direction:column;overflow:hidden;z-index:30;transition:transform .25s ease}
.sb-head{padding:18px 18px 14px;border-bottom:1px solid var(--b2);flex-shrink:0}
.sb-brand{font-family:var(--serif);font-size:14px;line-height:1.35;color:var(--t1)}
.sb-brand em{display:block;font-family:var(--mono);font-size:9px;color:var(--t3);letter-spacing:.09em;font-style:normal;text-transform:uppercase;margin-bottom:4px}
.sb-nav{flex:1;overflow-y:auto;padding:8px 0}
.sb-nav::-webkit-scrollbar{display:none}
.sb-foot{padding:12px 18px;border-top:1px solid var(--b2);flex-shrink:0}
.sb-fl{display:flex;flex-direction:column;gap:6px}
.f-label{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--t3)}
.f-in{width:100%;font-family:var(--sans);font-size:12px;color:var(--t1);background:var(--bg);border:1px solid var(--b);border-radius:6px;padding:6px 9px;outline:none;transition:border-color .15s}
.f-in:focus{border-color:var(--t1)}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:29}

/* Flat top-level nav items (Instructions, Dashboard, Report) */
.ni{display:flex;align-items:center;gap:8px;padding:7px 18px;cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:background .12s}
.ni:hover{background:var(--bg)}
.ni.on{background:var(--t1)}
.ni.on .ni-name,.ni.on .ni-num{color:#fff}
.ni.on .ni-num{color:rgba(255,255,255,.4)}
.ni-num{font-family:var(--mono);font-size:9px;color:var(--t3);width:18px;flex-shrink:0}
.ni-name{font-size:12px;font-weight:500;color:var(--t2);flex:1;text-align:left}
.ni-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;transition:background .3s}

/* ── ACCORDION GROUPS ── */
/* Top-level accordion trigger (Phases / Tools) */
.acc-trigger{display:flex;align-items:center;gap:8px;padding:9px 18px 9px 14px;cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:background .12s;border-top:1px solid var(--b2)}
.acc-trigger:first-child{border-top:none}
.acc-trigger:hover{background:var(--bg)}
.acc-icon{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;transition:background .12s}
.acc-label{font-size:12px;font-weight:700;color:var(--t1);flex:1;text-align:left;letter-spacing:-.01em}
.acc-badge{font-family:var(--mono);font-size:9px;color:var(--t3);background:var(--bg);border:1px solid var(--b2);border-radius:99px;padding:1px 7px;flex-shrink:0}
.acc-chevron{font-size:9px;color:var(--t3);transition:transform .2s;flex-shrink:0}
.acc-chevron.open{transform:rotate(180deg)}

/* Sub-item container */
.acc-body{overflow:hidden;transition:max-height .22s ease,opacity .18s ease;max-height:0;opacity:0}
.acc-body.open{max-height:600px;opacity:1}

/* Phase sub-items */
.phase-item{display:flex;align-items:center;gap:0;padding:0;border:none;background:none;width:100%;cursor:pointer;transition:background .1s}
.phase-item:hover:not(.locked){background:var(--bg)}
.phase-item.active{background:var(--t1)}
.phase-item.locked{cursor:not-allowed;opacity:.45}
.phase-item-inner{display:flex;align-items:center;gap:9px;padding:7px 18px 7px 14px;width:100%}

/* Phase state indicator */
.phase-pip{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0;font-family:var(--mono);border:1.5px solid transparent;transition:all .2s}
.pip-done{background:#dcfce7;border-color:#22c55e;color:#15803d}
.pip-active{background:var(--t1);border-color:var(--t1);color:#fff}
.pip-progress{background:#fffbeb;border-color:#f59e0b;color:#b45309}
.pip-locked{background:var(--bg);border-color:var(--b);color:var(--t3)}

.phase-item-name{font-size:11.5px;font-weight:500;color:var(--t2);flex:1;text-align:left;line-height:1.3}
.phase-item.active .phase-item-name{color:#fff;font-weight:600}
.phase-item.locked .phase-item-name{color:var(--t3)}
.phase-item-pct{font-family:var(--mono);font-size:9px;color:var(--t3);flex-shrink:0}
.phase-item.active .phase-item-pct{color:rgba(255,255,255,.5)}

/* Lock icon */
.lock-icon{font-size:9px;color:var(--t3);flex-shrink:0;margin-left:2px}

/* Tool sub-items */
.tool-item{display:flex;align-items:center;gap:9px;padding:6px 18px 6px 14px;cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:background .1s}
.tool-item:hover{background:var(--bg)}
.tool-item.active{background:var(--t1)}
.tool-dot{width:5px;height:5px;border-radius:50%;background:var(--b);flex-shrink:0}
.tool-item.active .tool-dot{background:rgba(255,255,255,.4)}
.tool-name{font-size:11.5px;font-weight:500;color:var(--t2);flex:1}
.tool-item.active .tool-name{color:#fff}

/* ── TOPBAR ── */
.topbar{display:none;align-items:center;gap:12px;padding:12px 16px;background:var(--card);border-bottom:1px solid var(--b);flex-shrink:0}
.hbg{background:none;border:none;cursor:pointer;padding:3px;display:flex;flex-direction:column;gap:4px}
.hbg span{display:block;width:18px;height:1.5px;background:var(--t1);border-radius:1px}
.tb-title{font-family:var(--serif);font-size:14px;color:var(--t1)}

/* ── MAIN + CENTERED CONTENT ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
/* The scrollable shell — full width, light bg */
.content{flex:1;overflow-y:auto;background:var(--bg)}
.content::-webkit-scrollbar{width:3px}
.content::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
/* The inner constrained column — 2/3 width, centred */
.content-inner{
  width:66.667%;
  max-width:900px;
  min-width:320px;
  margin:0 auto;
  padding:32px 0 80px;
}

/* COMMON */
.sec-label{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.09em;color:var(--t3);margin:20px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--b2)}
.page-title{font-family:var(--serif);font-size:28px;line-height:1.15;margin-bottom:4px}
.page-sub{font-size:12.5px;color:var(--t3);margin-bottom:20px;line-height:1.5}
.card{background:var(--card);border:1px solid var(--b);border-radius:10px;padding:18px}
.std-badge{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-size:9px;color:var(--t3);background:var(--bg);border:1px solid var(--b2);border-radius:5px;padding:3px 8px;margin-bottom:18px}

/* DASHBOARD */
.dash-title{font-family:var(--serif);font-size:32px;line-height:1.12;margin-bottom:3px}
.dash-sub{font-size:12px;color:var(--t3);margin-bottom:24px}
.phase-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:9px;margin-bottom:8px}
.pc{background:var(--card);border:1px solid var(--b);border-radius:9px;padding:14px;cursor:pointer;transition:border-color .15s,transform .15s}
.pc:hover{border-color:var(--t1);transform:translateY(-1px)}
.pc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:9px}
.pc-num{font-family:var(--mono);font-size:8.5px;color:var(--t3);margin-bottom:2px}
.pc-name{font-size:12px;font-weight:600}
.pc-q{font-size:10px;color:var(--t3);margin-top:1px}
.pc-ring{position:relative;width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.pc-ring-num{position:absolute;font-family:var(--mono);font-size:7px;color:var(--t3)}
.bar-track{height:2px;background:var(--b2);border-radius:2px;overflow:hidden;margin-top:8px}
.bar-fill{height:100%;border-radius:2px;transition:width .5s ease}

/* RISK HEATMAP */
.heatmap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:8px}
.hm-card{border-radius:9px;padding:14px;border:1.5px solid transparent;cursor:default;transition:transform .12s}
.hm-card:hover{transform:translateY(-1px)}
.hm-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:99px;font-family:var(--mono);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}
.hm-label{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:4px}
.hm-desc{font-size:11px;color:var(--t2);line-height:1.5}

/* PHASE */
.ph-label{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.09em;color:var(--t3);margin-bottom:5px}
.ph-title{font-family:var(--serif);font-size:26px;line-height:1.15;margin-bottom:5px}
.ph-desc{font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:10px}
.ph-prog{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--b2);margin-bottom:18px}
.ph-prog-bar{flex:1;height:2px;background:var(--b2);border-radius:2px;overflow:hidden}
.ph-prog-fill{height:100%;border-radius:2px;background:var(--t1);transition:width .4s ease}
.ph-prog-txt{font-family:var(--mono);font-size:9.5px;color:var(--t3);white-space:nowrap}

/* QUESTION CARDS */
.qc{background:var(--card);border:1px solid var(--b);border-left:3px solid transparent;border-radius:9px;padding:15px 16px;margin-bottom:8px;transition:border-color .2s}
.qc.ans-yes{border-left-color:#22c55e}
.qc.ans-in_progress{border-left-color:#f59e0b}
.qc.ans-no{border-left-color:#ef4444}
.qc.ans-not_applicable{border-left-color:#9ca3af}
.qc-top{display:flex;align-items:flex-start;gap:10px}
.qc-num{font-family:var(--mono);font-size:9.5px;color:var(--t3);padding-top:2px;min-width:20px;flex-shrink:0}
.qc-body{flex:1;min-width:0}
.qc-text{font-size:13px;line-height:1.5;margin-bottom:10px;font-weight:450}
.qc-opts{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:7px}
.qc-opt{border:1px solid var(--b);border-radius:5px;padding:6px 12px;font-size:11px;font-weight:500;cursor:pointer;background:none;color:var(--t2);transition:all .1s;font-family:var(--sans);min-height:36px;display:flex;align-items:center}
.qc-opt:hover{border-color:var(--t1);color:var(--t1)}
.opt-yes.sel{background:#f0fdf4;border-color:#22c55e;color:#15803d}
.opt-prog.sel{background:#fffbeb;border-color:#f59e0b;color:#b45309}
.opt-no.sel{background:#fef2f2;border-color:#ef4444;color:#b91c1c}
.opt-na.sel{background:#f9fafb;border-color:#9ca3af;color:#6b7280}
.qc-g-btn{font-size:10.5px;color:var(--t3);cursor:pointer;background:none;border:none;padding:0;font-family:var(--sans);display:flex;align-items:center;gap:3px}
.qc-g-btn:hover{color:var(--t1)}
.qc-guide{font-size:11.5px;color:var(--t2);background:var(--bg);border-radius:5px;padding:9px 11px;margin-top:8px;line-height:1.6;border-left:2px solid var(--b)}
.action-box{background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:8px 12px;margin-top:8px;font-size:11px;color:#991b1b;line-height:1.5}
.action-box-prog{background:#fffbeb;border-color:#fde68a;color:#92400e}

/* EVIDENCE PANEL */
.evidence-panel{background:var(--bg);border:1px solid var(--b2);border-radius:6px;padding:10px 12px;margin-top:8px}
.evidence-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.evidence-label{font-family:var(--mono);font-size:8.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);margin-bottom:3px}
.evidence-in{width:100%;font-family:var(--sans);font-size:11px;color:var(--t1);background:var(--card);border:1px solid var(--b2);border-radius:5px;padding:5px 8px;outline:none;transition:border-color .15s}
.evidence-in:focus{border-color:var(--t1)}
.evidence-badge{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-size:8px;color:var(--t3);background:var(--card);border:1px solid var(--b2);border-radius:4px;padding:2px 6px;cursor:pointer;transition:all .12s}
.evidence-badge:hover{border-color:var(--t1);color:var(--t1)}
.evidence-badge.filled{color:#15803d;border-color:#86efac;background:#f0fdf4}

/* WORKFLOW ALERTS */
.workflow-alert{display:flex;align-items:flex-start;gap:10px;border-radius:9px;padding:12px 14px;margin-bottom:10px;border:1.5px solid}
.wf-critical{background:#fef2f2;border-color:#fca5a5}
.wf-high{background:#fff7ed;border-color:#fed7aa}
.wf-info{background:#eff6ff;border-color:#bfdbfe}

/* PHASE NAV */
.ph-nav{display:flex;justify-content:space-between;gap:10px;margin-top:28px;padding-top:18px;border-top:1px solid var(--b2)}
.ph-nav-btn{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11.5px;font-weight:500;color:var(--t2);background:var(--card);border:1px solid var(--b);border-radius:6px;padding:10px 14px;cursor:pointer;transition:all .12s;font-family:var(--sans);min-height:44px}
.ph-nav-btn:hover{border-color:var(--t1);color:var(--t1)}
.ph-nav-btn.primary{background:var(--t1);border-color:var(--t1);color:#fff}
.ph-nav-btn.primary:hover{opacity:.88}

/* TOOLS */
.tool-table{width:100%;border-collapse:collapse;font-size:12px}
.tool-table th{font-family:var(--mono);font-size:8.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);text-align:left;padding:7px 10px;background:var(--bg);border-bottom:1px solid var(--b)}
.tool-table td{padding:9px 10px;border-bottom:1px solid var(--b2);vertical-align:top;color:var(--t2)}
.tool-table tr:last-child td{border-bottom:none}
.tool-table tr:hover td{background:#fafaf8}
.tbl-in{width:100%;font-family:var(--sans);font-size:11.5px;color:var(--t1);background:transparent;border:none;outline:none;padding:0;min-width:60px}
.tbl-in:focus{background:var(--bg);border-radius:3px;padding:2px 4px}
.tbl-sel{font-family:var(--sans);font-size:11px;border:1px solid var(--b);border-radius:4px;padding:3px 6px;background:var(--card);color:var(--t1);outline:none;cursor:pointer}
.tbl-sel:focus{border-color:var(--t1)}
.status-badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;white-space:nowrap}
.s-notstarted{background:#f9fafb;color:#6b7280}
.s-inprogress{background:#fffbeb;color:#b45309}
.s-complete{background:#f0fdf4;color:#15803d}
.s-na{background:#f0f4ff;color:#3b82f6}

/* STEP CARDS */
.step-card{background:var(--card);border:1px solid var(--b);border-radius:9px;padding:16px 18px;margin-bottom:8px}
.step-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px}
.step-num{font-family:var(--mono);font-size:9px;color:var(--t3);background:var(--bg);border:1px solid var(--b2);border-radius:4px;padding:3px 7px;flex-shrink:0;margin-top:1px}
.step-title{font-size:13.5px;font-weight:600;flex:1}
.step-legal{font-family:var(--mono);font-size:8.5px;color:var(--t3);background:var(--bg);border:1px solid var(--b2);border-radius:3px;padding:2px 6px;margin-top:6px;display:inline-block}
.step-guidance{font-size:11.5px;color:var(--t2);background:var(--bg);border-left:2px solid var(--b);border-radius:0 5px 5px 0;padding:8px 11px;margin-bottom:10px;line-height:1.6}
.step-timeframe{font-size:10.5px;color:var(--t3);margin-bottom:8px;font-family:var(--mono)}
.step-ta{width:100%;min-height:80px;font-family:var(--sans);font-size:12px;color:var(--t1);background:var(--bg);border:1px solid var(--b2);border-radius:6px;padding:9px 11px;outline:none;resize:vertical;transition:border-color .15s;line-height:1.5}
.step-ta:focus{border-color:var(--t1);background:var(--card)}

/* KEY CONTACTS */
.kc-grid{display:grid;grid-template-columns:1fr;gap:8px}
.kc-card{background:var(--card);border:1px solid var(--b);border-radius:9px;padding:14px 16px;display:grid;grid-template-columns:200px 1fr 1fr 1fr;gap:10px;align-items:start}
.kc-role{font-size:11.5px;font-weight:600;white-space:pre-line;line-height:1.35;color:var(--t1);min-width:160px}
.kc-note{font-size:10px;color:var(--t3);margin-top:3px;line-height:1.4;min-width:160px;grid-column:1}
.kc-field{display:flex;flex-direction:column;gap:3px}
.kc-flabel{font-family:var(--mono);font-size:8px;text-transform:uppercase;letter-spacing:.07em;color:var(--t3)}
.kc-in{width:100%;font-family:var(--sans);font-size:12px;color:var(--t1);background:var(--bg);border:1px solid var(--b2);border-radius:5px;padding:5px 8px;outline:none;transition:border-color .15s}
.kc-in:focus{border-color:var(--t1)}

/* ACTION TRACKER */
.at-filters{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.at-filter{font-size:11px;font-weight:500;padding:4px 10px;border:1px solid var(--b);border-radius:5px;cursor:pointer;background:var(--card);color:var(--t2);font-family:var(--sans);transition:all .12s}
.at-filter.active{background:var(--t1);border-color:var(--t1);color:#fff}
.at-code{font-family:var(--mono);font-size:9.5px;color:var(--t3)}
.priority-badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:9.5px;font-weight:600;font-family:var(--mono)}
.p-critical{background:#fef2f2;color:#991b1b}
.p-high{background:#fff7ed;color:#9a3412}
.p-medium{background:#fffbeb;color:#b45309}
.p-low{background:#f0f9ff;color:#0369a1}

/* TOOL NAV BAR */
.tool-nav-bar{position:sticky;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--b);padding:8px 12px;display:flex;flex-wrap:wrap;gap:5px;z-index:10}
.tool-nav-btn{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.06em;padding:4px 9px;border:1px solid var(--b2);border-radius:4px;cursor:pointer;background:var(--bg);color:var(--t3);transition:all .12s}
.tool-nav-btn:hover{border-color:var(--t1);color:var(--t1)}
.tool-nav-btn.active{background:var(--t1);border-color:var(--t1);color:#fff}

/* SCENARIO SIMULATOR */
.scenario-card{background:var(--card);border:1px solid var(--b);border-radius:10px;padding:16px;margin-bottom:10px;cursor:pointer;transition:border-color .15s,transform .12s}
.scenario-card:hover{border-color:var(--t1);transform:translateY(-1px)}
.scenario-sev-critical{color:#991b1b;background:#fef2f2;border-color:#fca5a5}
.scenario-sev-high{color:#9a3412;background:#fff7ed;border-color:#fed7aa}
.scenario-sev-medium{color:#b45309;background:#fffbeb;border-color:#fde68a}

/* COMPLIANCE REPORT */
.report-section{margin-bottom:20px}
.report-section h3{font-family:var(--serif);font-size:16px;margin-bottom:8px;border-bottom:1px solid var(--b2);padding-bottom:5px}
.report-table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.report-table th{text-align:left;padding:5px 8px;background:var(--bg);border-bottom:1px solid var(--b);font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--t3)}
.report-table td{padding:5px 8px;border-bottom:1px solid var(--b2);color:var(--t2);vertical-align:top}

/* INSTRUCTIONS */
.inst-phase-row{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;padding:10px 0;border-bottom:1px solid var(--b2)}
.inst-phase-row:last-child{border-bottom:none}
.inst-phase-num{font-family:var(--mono);font-size:9px;color:var(--t3);background:var(--bg);border:1px solid var(--b2);border-radius:4px;padding:3px 7px;white-space:nowrap}
.inst-phase-desc{font-size:12.5px;color:var(--t2);line-height:1.5;cursor:pointer}
.def-table{width:100%;border-collapse:collapse;font-size:12px}
.def-table td{padding:8px 10px;border-bottom:1px solid var(--b2);vertical-align:top}
.def-table tr:last-child td{border-bottom:none}
.def-term{font-weight:600;color:var(--t1);width:180px;white-space:nowrap}
.def-meaning{color:var(--t2);line-height:1.55}
.def-ref{font-family:var(--mono);font-size:9px;color:var(--t3);margin-top:3px}

/* RESPONSIVE TABLES — card mode on mobile */
.tbl-responsive{overflow-x:auto;-webkit-overflow-scrolling:touch}
.mob-card-list{display:none}

/* PRINT */
@media print{
  .sb,.topbar,.ph-nav,.tool-nav-bar,.no-print{display:none!important}
  .main{overflow:visible!important}
  .content{padding:12px 20px 20px!important;overflow:visible!important}
  .app{display:block!important;height:auto!important}
  .step-card,.kc-card,.qc,.hm-card,.report-section{break-inside:avoid;page-break-inside:avoid}
  body{background:#fff!important}
  :root{--bg:#fff;--card:#fff;--b:#ccc;--b2:#ddd}
  .qc-g-btn,.evidence-badge{display:none!important}
  @page{margin:1.2cm 1.5cm}
}

/* ─── TABLET  769px–1024px ─── */
@media(min-width:769px) and (max-width:1024px){
  :root{--sw:220px}
  .content-inner{width:85%;padding:24px 0 80px}
  .heatmap-grid{grid-template-columns:repeat(2,1fr)}
  .phase-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
  .kc-card{grid-template-columns:1fr 1fr;gap:10px}
  .kc-card>div:first-child{grid-column:span 2}
  .report-inner{padding:22px 24px!important}
}

/* ─── MOBILE  ≤768px ─── */
@media(max-width:768px){
  .sb{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%);width:280px;min-width:280px}
  .sb.open{transform:translateX(0);box-shadow:8px 0 32px rgba(0,0,0,.15)}
  .overlay{display:block;opacity:0;pointer-events:none;transition:opacity .25s}
  .overlay.vis{opacity:1;pointer-events:auto}
  .topbar{display:flex}
  .content-inner{width:100%;padding:16px 14px 100px}
  .dash-title{font-size:22px}
  .page-title{font-size:22px}
  .ph-title{font-size:20px}
  .phase-grid{grid-template-columns:1fr 1fr}
  .heatmap-grid{grid-template-columns:1fr 1fr}
  .ph-nav{gap:6px}
  .ph-nav-btn{font-size:10.5px;padding:8px 10px}
  .tool-nav-bar{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:8px 10px;gap:6px}
  .tool-nav-bar::-webkit-scrollbar{display:none}
  .tool-nav-btn{flex-shrink:0;padding:5px 10px;font-size:8.5px}
  .qc{padding:12px 12px}
  .qc-opts{gap:6px}
  .qc-opt{padding:6px 10px;font-size:11.5px}
  .kc-card{grid-template-columns:1fr!important;gap:8px}
  .kc-role{min-width:unset}
  .kc-note{min-width:unset}
  .evidence-row{grid-template-columns:1fr}
  .tbl-responsive{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px}
  .tool-table{min-width:600px}
  .kt-row{grid-template-columns:1fr!important}
  .kt-term{border-right:none!important;border-bottom:1px solid var(--b2)}
  .report-inner{padding:18px 16px!important}
  .report-phase-grid{grid-template-columns:1fr!important}
  .breach-form-grid{grid-template-columns:1fr!important}
  .signoff-grid{grid-template-columns:1fr!important}
  .step-card{padding:12px 14px}
  .scenario-card{padding:13px}
}

/* ─── SMALL MOBILE  ≤480px ─── */
@media(max-width:480px){
  .phase-grid{grid-template-columns:1fr}
  .heatmap-grid{grid-template-columns:1fr}
  .score-row{flex-direction:column!important;align-items:flex-start!important;gap:12px!important;padding:14px 16px!important}
  .score-ring-wrap{align-self:center}
  .ph-nav{gap:4px}
  .ph-nav-btn{flex:1;justify-content:center;font-size:10px;padding:8px 6px}
  .qc-opts{display:grid;grid-template-columns:1fr 1fr;gap:5px}
  .qc-opt{text-align:center;justify-content:center;padding:8px 6px}
  .kc-role{min-width:unset}
  .kc-note{min-width:unset}
  .at-filters{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}
  .at-filter{flex-shrink:0}
}
`;

/* ═══════════════════════════════════════════════════════════════
   INITIAL STATE
═══════════════════════════════════════════════════════════════ */
const mkDocState = ()=>Object.fromEntries(DOC_CHECKLIST.map(d=>[d.id,{status:"Not started",dateImpl:"",dateTrain:"",owner:""}]));
const mkRetState = ()=>Object.fromEntries(RETENTION.map(r=>[r.id,""]));
const mkDpiaState= ()=>Object.fromEntries(DPIA_STEPS.map(s=>[`step${s.step}`,{response:"",status:"Not started"}]));
const mkIrpState = ()=>Object.fromEntries(IRP_STEPS.map(s=>[`step${s.step}`,""]));
const mkKcState  = ()=>({
  contacts:Object.fromEntries(KEY_CONTACTS_ROLES.map(r=>[r.id,{name:"",phone:"",email:""}])),
  processors:Object.fromEntries(PROCESSOR_TYPES.map(p=>[p.id,{company:"",phone:"",email:"",dpa:""}])),
});
const mkAtState  = ()=>Object.fromEntries(ACTION_ITEMS.map(a=>[a.code,{date:"",owner:"",notes:""}]));
const mkScenarioState=()=>({});
const DEFAULT_STATE={
  answers:{}, charityName:"", icoNumber:"",
  dpName:"", criticalActivities:"", dataDependencies:"",
  annualReviewDate:"",
  docState:mkDocState(), retState:mkRetState(), dpiaState:mkDpiaState(),
  dpiaActivity:"", irpState:mkIrpState(), kcState:mkKcState(),
  atState:mkAtState(), breachState:[], scenarioState:mkScenarioState(),
};

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView]   = useState("instructions");
  const [st, setSt]       = useState(DEFAULT_STATE);
  const [sbOpen, setSb]   = useState(false);
  const [guidance, setG]  = useState({});
  const [evidenceOpen,setEvOpen] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [atFilter, setAtFilter] = useState("all");

  useEffect(()=>{
    (async()=>{
      try {
        const r = await appStorage.get("dpirf_v8");
        if(r?.value){const d=JSON.parse(r.value);setSt(prev=>({...prev,...d}));}
      } catch(_){}
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{
    if(!loaded) return;
    appStorage.set("dpirf_v8",JSON.stringify(st)).catch(()=>{});
    setSavedAt(new Date());
  },[st,loaded]);

  const upd=useCallback((key,val)=>setSt(p=>({...p,[key]:val})),[]);

  // Answers now carry metadata: {value, evidenceNote, approvedBy, approvedDate}
  const setAns=(id,field,val)=>setSt(p=>{
    const prev=p.answers[id]||{};
    const next={...prev,[field]:val};
    // If toggling value (click same), remove value
    if(field==="value" && prev.value===val) delete next.value;
    return {...p,answers:{...p.answers,[id]:next}};
  });
  const contentRef = useRef(null);
  const toggleG=id=>setG(p=>({...p,[id]:!p[id]}));
  const toggleEv=id=>setEvOpen(p=>({...p,[id]:!p[id]}));
  const toolsUnlocked = allPhaseQuestionsAnswered(st.answers);

  const nav=v=>{
    if(isToolView(v) && !toolsUnlocked) return;
    setView(v);
    setSb(false);
    // Always scroll the content pane back to the top on every navigation
    if(contentRef.current) contentRef.current.scrollTop = 0;
  };

  useEffect(()=>{
    if(loaded && isToolView(view) && !toolsUnlocked) setView("instructions");
  },[loaded, view, toolsUnlocked]);

  const phase=typeof view==="number"?PHASES.find(p=>p.id===view):null;
  const overall=overallScore(st.answers);
  const t=tier(overall.pct,overall.answered);

  if(!loaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",
      fontFamily:"var(--mono)",fontSize:12,color:"#8a8680",background:"#f5f4f0"}}>Loading…</div>
  );

  const VIEW_NAMES={
    dashboard:"Dashboard",instructions:"Instructions",
    "doc-checklist":"Doc Checklist",retention:"Retention Schedule",
    "data-register":"Data Register",dpia:"DPIA Template",
    irp:"Incident Response Plan","key-contacts":"Key Contacts",
    "action-tracker":"Action Tracker","breach-register":"Breach Register",
    "scenario-sim":"Scenario Simulator","compliance-report":"Compliance Report",
  };
  const titleForView=()=>{
    if(typeof view==="number") return `Phase 0${view} · ${PHASES[view-1].name}`;
    return VIEW_NAMES[view]||"DPIRF";
  };
  const savedStr=savedAt?`Saved ${savedAt.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`:"";

  return (
    <>
      <style>{CSS}</style>
      <div className={`overlay ${sbOpen?"vis":""}`} onClick={()=>setSb(false)}/>
      <div className="app">

        {/* ── SIDEBAR ── */}
        <aside className={`sb ${sbOpen?"open":""}`}>
          <div className="sb-head">
            <div className="sb-brand">
              <em>DPIRF · UK Charities</em>
              Data Privacy Incident<br/>Response Framework
            </div>
            {overall.answered>0 && (
              <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:t.bg,border:`1px solid ${t.border}`,borderRadius:7}}>
                <div style={{fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:t.fg}}>{t.icon} {overall.pct}%</div>
                <div style={{fontFamily:"var(--mono)",fontSize:8.5,color:t.fg+"99",flex:1,textTransform:"uppercase",letterSpacing:".05em"}}>{t.label}</div>
              </div>
            )}
          </div>

          <nav className="sb-nav">
            {/* ── Top-level flat links ── */}
            {[
              ["instructions","📋","How to Use"],
              ["dashboard","📊","Dashboard"],
              ["compliance-report","📄","Compliance Report"],
            ].map(([v,icon,label])=>{
              const isLocked = v === "compliance-report" && !toolsUnlocked;
              return (
              <button key={v} className={`ni ${view===v?"on":""}`} onClick={()=>nav(v)} title={isLocked ? "Complete all 8 phases to unlock tools" : label} style={{opacity:isLocked ? 0.55 : 1,cursor:isLocked ? "not-allowed" : "pointer"}}>
                <span className="ni-num">{icon}</span>
                <span className="ni-name">{label}</span>
              </button>
            )})}

            {/* ── ACCORDION: Phases ── */}
            <AccordionPhases
              phases={PHASES}
              answers={st.answers}
              currentView={view}
              onNav={nav}
            />

            {/* ── ACCORDION: Tools ── */}
            <AccordionTools currentView={view} onNav={nav} answers={st.answers}/>
          </nav>

          <div className="sb-foot">
            {savedStr && (
              <div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--t3)",marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                <span style={{color:"#22c55e"}}>●</span> {savedStr}
              </div>
            )}
            <div className="sb-fl">
              <div>
                <div className="f-label">Charity name</div>
                <input className="f-in" placeholder="Enter your charity…" value={st.charityName} onChange={e=>upd("charityName",e.target.value)}/>
              </div>
              <div>
                <div className="f-label">ICO Reg. No.</div>
                <input className="f-in" placeholder="e.g. ZA123456" value={st.icoNumber} onChange={e=>upd("icoNumber",e.target.value)}/>
              </div>
              <div>
                <div className="f-label">Data protection lead</div>
                <input className="f-in" placeholder="Lead's full name…" value={st.dpName} onChange={e=>upd("dpName",e.target.value)}/>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          {/* Mobile topbar */}
          <div className="topbar">
            <button className="hbg" onClick={()=>setSb(s=>!s)}><span/><span/><span/></button>
            <div style={{flex:1,minWidth:0}}>
              <div className="tb-title" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{titleForView()}</div>
              {typeof view==="number" && phase && (()=>{
                const sc=phaseScore(phase,st.answers);
                return sc.answered>0 ? (
                  <div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--t3)",marginTop:1}}>{sc.answered}/{phase.questions.length} answered · {sc.pct}%</div>
                ) : null;
              })()}
            </div>
            {overall.answered>0 && (
              <div style={{fontFamily:"var(--mono)",fontSize:10,fontWeight:700,color:t.fg,background:t.bg,border:`1px solid ${t.border}`,borderRadius:5,padding:"3px 8px",flexShrink:0}}>
                {overall.pct}%
              </div>
            )}
          </div>

          {/* Scrollable shell — full width */}
          <div className="content" ref={contentRef}>
            {/* Centred 2/3 column */}
            <div className="content-inner">
              {view==="dashboard"        && <Dashboard answers={st.answers} onPhase={nav} charityName={st.charityName} st={st} upd={upd}/>}
              {view==="instructions"     && <Instructions onNav={nav} answers={st.answers}/>}
              {view==="compliance-report"&& <ComplianceReport st={st} onNav={nav}/>}
              {typeof view==="number" && phase &&
                <PhaseView phase={phase} answers={st.answers} setAns={setAns} guidance={guidance} toggleG={toggleG}
                  evidenceOpen={evidenceOpen} toggleEv={toggleEv} onNav={nav} st={st} upd={upd}/>}
              {view==="doc-checklist"   && <DocChecklist state={st.docState} onChange={v=>upd("docState",v)} onNav={nav}/>}
              {view==="retention"       && <RetentionSchedule state={st.retState} onChange={v=>upd("retState",v)} onNav={nav}/>}
              {view==="data-register"   && <DataRegister charityName={st.charityName} icoNumber={st.icoNumber} onNav={nav}/>}
              {view==="dpia"            && <DpiaTemplate state={st.dpiaState} activity={st.dpiaActivity}
                  onChange={v=>upd("dpiaState",v)} onActivity={v=>upd("dpiaActivity",v)}
                  charityName={st.charityName} onNav={nav}/>}
              {view==="irp"             && <IrpView state={st.irpState} onChange={v=>upd("irpState",v)}
                  charityName={st.charityName} icoNumber={st.icoNumber} dpName={st.dpName} onNav={nav}/>}
              {view==="key-contacts"    && <KeyContactsView state={st.kcState} onChange={v=>upd("kcState",v)}
                  charityName={st.charityName} icoNumber={st.icoNumber} dpName={st.dpName} onNav={nav}/>}
              {view==="action-tracker"  && <ActionTracker answers={st.answers} state={st.atState}
                  onChange={v=>upd("atState",v)} filter={atFilter} setFilter={setAtFilter}
                  charityName={st.charityName} onNav={nav}/>}
              {view==="breach-register" && <BreachRegister state={st.breachState} onChange={v=>upd("breachState",v)}
                  charityName={st.charityName} onNav={nav}/>}
              {view==="scenario-sim"    && <ScenarioSimulator state={st.scenarioState} onChange={v=>upd("scenarioState",v)} onNav={nav}/>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCORDION PHASES  (sequential locking)
═══════════════════════════════════════════════════════════════ */
function AccordionPhases({phases, answers, currentView, onNav}) {
  const [open, setOpen] = useState(true); // open by default

  // Compute state for each phase
  const phaseStates = phases.map((p, idx) => {
    const sc = phaseScore(p, answers);
    const allAnswered = p.questions.every(q => getAnsValue(answers, q.id));
    const hasNo = p.questions.some(q => getAnsValue(answers, q.id) === "no");
    const isComplete = allAnswered && !hasNo;
    const hasProgress = sc.answered > 0;

    // Sequential lock logic: phase is unlocked if:
    // - It's Phase 1 (always unlocked), OR
    // - All questions in the PREVIOUS phase have been answered
    const prevPhase = idx > 0 ? phases[idx - 1] : null;
    const prevAllAnswered = prevPhase
      ? prevPhase.questions.every(q => getAnsValue(answers, q.id))
      : true;
    const isLocked = idx > 0 && !prevAllAnswered;

    return { ...p, sc, isComplete, hasProgress, isLocked };
  });

  const completedCount = phaseStates.filter(p => p.isComplete).length;

  // pip appearance
  const getPipClass = (p) => {
    if (p.isComplete) return "pip-done";
    if (typeof currentView === "number" && currentView === p.id) return "pip-active";
    if (p.hasProgress) return "pip-progress";
    if (p.isLocked) return "pip-locked";
    return "pip-locked"; // not started but unlocked — show neutral
  };
  const getPipLabel = (p) => {
    if (p.isComplete) return "✓";
    if (p.isLocked) return "🔒";
    if (p.hasProgress) return `${p.sc.pct}`;
    return `${String(p.id).padStart(2,"0")}`;
  };

  return (
    <div style={{borderTop:"1px solid var(--b2)"}}>
      {/* Trigger */}
      <button className="acc-trigger" onClick={()=>setOpen(o=>!o)}>
        <div className="acc-icon" style={{background:"#f0fdf4",color:"#15803d"}}>⚙</div>
        <span className="acc-label">Phases</span>
        <span className="acc-badge">{completedCount}/{phases.length}</span>
        <span className={`acc-chevron ${open?"open":""}`}>▼</span>
      </button>

      {/* Sub-items */}
      <div className={`acc-body ${open?"open":""}`}>
        {phaseStates.map(p => {
          const isActive = currentView === p.id;
          return (
            <button
              key={p.id}
              className={`phase-item ${isActive?"active":""} ${p.isLocked?"locked":""}`}
              onClick={() => !p.isLocked && onNav(p.id)}
              title={p.isLocked ? `Complete Phase ${p.id - 1} to unlock` : p.name}
            >
              <div className="phase-item-inner">
                {/* State pip */}
                <div className={`phase-pip ${getPipClass(p)}`}>
                  {getPipLabel(p)}
                </div>
                {/* Name */}
                <span className="phase-item-name">{p.name}</span>
                {/* Right: % or lock */}
                {p.isLocked ? (
                  <span className="lock-icon">🔒</span>
                ) : p.hasProgress && !p.isComplete ? (
                  <span className="phase-item-pct">{p.sc.pct}%</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCORDION TOOLS
═══════════════════════════════════════════════════════════════ */
const TOOLS_LIST = [
  {v:"doc-checklist",  label:"Doc Checklist",       icon:"📋"},
  {v:"retention",      label:"Retention Schedule",   icon:"🗓"},
  {v:"data-register",  label:"Data Register",        icon:"🗄"},
  {v:"dpia",           label:"DPIA Template",        icon:"⚖️"},
  {v:"irp",            label:"Incident Response Plan",icon:"🧯"},
  {v:"key-contacts",   label:"Key Contacts",         icon:"📞"},
  {v:"action-tracker", label:"Action Tracker",       icon:"✔️"},
  {v:"breach-register",label:"Breach Register",      icon:"📗"},
  {v:"scenario-sim",   label:"Scenario Simulator",   icon:"🎯"},
];

function AccordionTools({currentView, onNav, answers}) {
  const [open, setOpen] = useState(false); // collapsed by default
  const toolsUnlocked = allPhaseQuestionsAnswered(answers);

  return (
    <div style={{borderTop:"1px solid var(--b2)"}}>
      {/* Trigger */}
      <button className="acc-trigger" onClick={()=>setOpen(o=>!o)}>
        <div className="acc-icon" style={{background:"#eff6ff",color:"#1d4ed8"}}>🛠</div>
        <span className="acc-label">Tools</span>
        <span className="acc-badge">{TOOLS_LIST.length}</span>
        <span className={`acc-chevron ${open?"open":""}`}>▼</span>
      </button>

      {/* Sub-items */}
      <div className={`acc-body ${open?"open":""}`}>
        {TOOLS_LIST.map(t => (
          <button
            key={t.v}
            className={`tool-item ${currentView===t.v?"active":""}`}
            onClick={()=>toolsUnlocked && onNav(t.v)}
            title={toolsUnlocked ? t.label : "Complete all 8 phases to unlock tools"}
            style={{opacity:toolsUnlocked ? 1 : 0.55,cursor:toolsUnlocked ? "pointer" : "not-allowed"}}
          >
            <span style={{fontSize:12,flexShrink:0}}>{toolsUnlocked ? t.icon : "🔒"}</span>
            <span className="tool-name">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD  (risk-led heatmap + completion)
═══════════════════════════════════════════════════════════════ */
function Dashboard({answers, onPhase, charityName, st, upd}) {
  const overall=overallScore(answers);
  const t=tier(overall.pct,overall.answered);
  const totalQ=PHASES.reduce((s,p)=>s+p.questions.length,0);
  const annualReviewDate=st?.annualReviewDate||"";
  const hasSpecialCat=getAnsValue(answers,"c1_3")==="yes";
  const counts={
    yes:Object.values(answers).filter(a=>(a?.value||a)==="yes").length,
    in_progress:Object.values(answers).filter(a=>(a?.value||a)==="in_progress").length,
    no:Object.values(answers).filter(a=>(a?.value||a)==="no").length,
    not_applicable:Object.values(answers).filter(a=>(a?.value||a)==="not_applicable").length,
  };
  const unanswered=totalQ-overall.answered;
  const hasAnswers=overall.answered>0;

  return (
    <>
      <div className="dash-title">{charityName||"Your Charity"}</div>
      <div className="dash-sub">Data Privacy Incident Response Framework · Compliance Overview</div>

      {/* Conditional workflow alert: Special Category */}
      {hasSpecialCat && (
        <div className="workflow-alert wf-critical">
          <span style={{fontSize:16,flexShrink:0}}>⚠</span>
          <div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".08em",color:"#b91c1c",marginBottom:3}}>
              Special Category Data — Additional Requirements Active
            </div>
            <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.55}}>
              Your answers indicate you collect sensitive personal data (Art 9). Three additional obligations apply automatically:
              (1) Document an <strong>Art 9(2) condition</strong> in your Data Register for each data type.
              (2) A <strong>DPIA is mandatory</strong> before processing health/ethnic/religious data — see Phase 3 Q2 and Phase 5 Q5.
              (3) Apply <strong>tighter retention limits</strong> — review your Retention Schedule for sensitive rows.
            </div>
            <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>onPhase(3)} style={{fontFamily:"var(--mono)",fontSize:9,color:"#b91c1c",background:"#fecaca",border:"none",borderRadius:4,padding:"3px 9px",cursor:"pointer"}}>→ Phase 3: DPIA</button>
              <button onClick={()=>onPhase("dpia")} style={{fontFamily:"var(--mono)",fontSize:9,color:"#b91c1c",background:"#fecaca",border:"none",borderRadius:4,padding:"3px 9px",cursor:"pointer"}}>→ DPIA Template</button>
              <button onClick={()=>onPhase("retention")} style={{fontFamily:"var(--mono)",fontSize:9,color:"#b91c1c",background:"#fecaca",border:"none",borderRadius:4,padding:"3px 9px",cursor:"pointer"}}>→ Retention Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Overall score */}
      <div style={{background:t.bg,border:`1.5px solid ${t.border}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
        <div className="score-row" style={{display:"flex",alignItems:"center",gap:20,padding:"18px 22px",borderBottom:`1px solid ${t.border}`}}>
          <div className="score-ring-wrap" style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ring pct={overall.pct} size={88} stroke={7}/>
            <div style={{position:"absolute",textAlign:"center"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:hasAnswers?18:14,fontWeight:600,color:t.fg,lineHeight:1}}>
                {hasAnswers?`${overall.pct}%`:"—"}
              </div>
              {hasAnswers&&<div style={{fontFamily:"var(--mono)",fontSize:8,color:t.fg+"99",letterSpacing:".04em",marginTop:2}}>compliant</div>}
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".09em",color:t.fg+"99",marginBottom:5}}>Overall Compliance Assessment</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:t.fg+"15",border:`1px solid ${t.border}`,borderRadius:6,padding:"5px 14px"}}>
              <span style={{fontSize:15}}>{t.icon}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:t.fg,letterSpacing:".04em",textTransform:"uppercase"}}>{t.label}</span>
              {hasAnswers&&<span style={{fontFamily:"var(--mono)",fontSize:11,color:t.fg+"99"}}>— {overall.pct}%</span>}
            </div>
            {hasAnswers&&(
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:t.fg+"99",marginTop:6}}>
                {overall.complete}/{overall.applicable} controls met · {overall.answered}/{overall.total} answered
              </div>
            )}
          </div>
        </div>
        {hasAnswers&&(
          <div style={{padding:"14px 22px",borderBottom:`1px solid ${t.border}`}}>
            {/* Stacked progress bar */}
            <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",marginBottom:10,gap:1}}>
              {[{n:counts.yes,c:"#15803d"},{n:counts.in_progress,c:"#f59e0b"},{n:counts.no,c:"#ef4444"},{n:counts.not_applicable,c:"#9ca3af"},{n:unanswered,c:"#d1d5db"}].map((b,i)=>b.n>0&&<div key={i} style={{flex:b.n,background:b.c,minWidth:2,transition:"flex .5s ease"}}/>)}
            </div>
            {/* Legend */}
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px 16px",marginBottom:8}}>
              {[{label:"Compliant",n:counts.yes,c:"#15803d"},{label:"In progress",n:counts.in_progress,c:"#b45309"},{label:"Action required",n:counts.no,c:"#b91c1c"},{label:"Not applicable",n:counts.not_applicable,c:"#6b7280"},...(unanswered>0?[{label:"Not yet answered",n:unanswered,c:"#9ca3af"}]:[])].map(b=>b.n>0&&(
                <div key={b.label} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:8,height:8,borderRadius:2,background:b.c,flexShrink:0}}/>
                  <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)"}}><strong style={{color:b.c}}>{b.n}</strong> {b.label}</span>
                </div>
              ))}
            </div>
            {/* Summary line */}
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:t.fg+"99"}}>
              {overall.complete} of {overall.applicable} applicable controls confirmed complete
              {unanswered>0?` · ${unanswered} question${unanswered===1?"":"s"} still to answer`:" · all questions answered"}
            </div>
          </div>
        )}
      </div>

      {/* ── Compliance Report CTA — shown once org info + any answers exist ── */}
      {(st.charityName || st.icoNumber || st.dpName) && hasAnswers && (
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:14, background:"var(--card)", border:"1px solid var(--b)",
          borderRadius:9, padding:"14px 18px", marginBottom:10, flexWrap:"wrap",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
            <span style={{fontSize:20,flexShrink:0}}>📄</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:2}}>
                Ready to share your compliance position?
              </div>
              <div style={{fontSize:11.5,color:"var(--t3)",lineHeight:1.5}}>
                Generate a plain-English Compliance Report for trustees, management or auditors — with your current scores, risk exposures and priority actions.
              </div>
            </div>
          </div>
          <button
            onClick={()=>onPhase("compliance-report")}
            style={{
              fontFamily:"var(--sans)",fontSize:12,fontWeight:600,
              color:"#fff",background:"var(--t1)",border:"none",
              borderRadius:6,padding:"9px 18px",cursor:"pointer",flexShrink:0,
              whiteSpace:"nowrap",
            }}>
            View Compliance Report →
          </button>
        </div>
      )}

      {/* ── RISK HEATMAP — only shown after meaningful progress ── */}
      {hasAnswers && overall.answered >= Math.floor(PHASES.reduce((s,p)=>s+p.questions.length,0)*0.4) && (
        <>
          <div className="sec-label">Risk Heatmap — Your Legal Exposures</div>
          <div className="heatmap-grid">
            {RISK_AREAS.map(area=>{
              const rs=riskScore(area,answers);
              return (
                <div key={area.id} className="hm-card" style={{background:rs.bg,borderColor:rs.color+"55"}}>
                  <div className="hm-badge" style={{background:rs.color+"20",color:rs.color,border:`1px solid ${rs.color}55`}}>
                    {rs.level}
                  </div>
                  <div className="hm-label">{area.label}</div>
                  <div className="hm-desc">{area.desc}</div>
                  {rs.level==="Unknown"&&(
                    <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginTop:6}}>Answer questions to assess this risk</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {hasAnswers && overall.answered < Math.floor(PHASES.reduce((s,p)=>s+p.questions.length,0)*0.4) && (
        <div style={{background:"var(--card)",border:"1px dashed var(--b)",borderRadius:9,padding:"18px 20px",marginBottom:8,textAlign:"center"}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".08em",color:"var(--t3)",marginBottom:6}}>Risk Heatmap</div>
          <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.6,marginBottom:8}}>Complete at least 40% of the phase questions to unlock your personalised risk exposure map.</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            {PHASES.slice(0,4).map(p=>{
              const sc=phaseScore(p,answers);
              return sc.answered < p.questions.length && (
                <button key={p.id} onClick={()=>onPhase(p.id)} style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t2)",background:"var(--bg)",border:"1px solid var(--b)",borderRadius:5,padding:"4px 10px",cursor:"pointer"}}>
                  Phase 0{p.id}: {p.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Phase grid ── */}
      <div className="sec-label">Phases</div>
      <div className="phase-grid">
        {PHASES.map(p=>{
          const sc=phaseScore(p,answers);
          return (
            <div key={p.id} className="pc" onClick={()=>onPhase(p.id)}>
              <div className="pc-top">
                <div><div className="pc-num">Phase 0{p.id}</div><div className="pc-name">{p.name}</div><div className="pc-q">{sc.answered}/{p.questions.length} answered</div></div>
                <div className="pc-ring"><Ring pct={sc.pct} size={32} stroke={3}/><div className="pc-ring-num">{sc.pct}%</div></div>
              </div>
              <div className="bar-track"><div className="bar-fill" style={{width:`${sc.pct}%`,background:arcColor(sc.pct)}}/></div>
            </div>
          );
        })}
      </div>

      {/* Annual review */}
      <div className="sec-label">Annual Review</div>
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:180}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:4}}>Next annual framework review date</div>
          <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>Set a fixed date to review your data protection arrangements each year — required by Phase 7.</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <input type="date" className="f-in" style={{width:160,fontFamily:"var(--mono)",fontSize:12}} value={annualReviewDate} onChange={e=>upd("annualReviewDate",e.target.value)}/>
          <div style={{fontFamily:"var(--mono)",fontSize:9,color:annualReviewDate?"#15803d":"#9ca3af"}}>{annualReviewDate?"✓ Scheduled":"— Not set"}</div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPLIANCE REPORT
═══════════════════════════════════════════════════════════════ */
const RISK_EXPLANATIONS = {
  lawfulBasis: {
    high: "Your organisation does not have documented legal reasons for collecting personal data. Under UK GDPR Art 6, every type of data processing must have a specific lawful basis written down before collection begins. Without this, your processing is unlawful and the ICO can issue a fine of up to £17.5 million or 4% of global turnover. Action: Complete Phase 1 Q2 and document a lawful basis for every data type in your Data Register.",
    medium: "Some lawful basis documentation may be incomplete. Review your Data Register to ensure every row has an Art 6 basis recorded.",
    low: "Lawful basis is documented. Continue to review whenever you start collecting a new type of personal data.",
  },
  specialCat: {
    high: "Your organisation collects sensitive personal data (health, ethnicity, religion, etc.) but has not completed the additional legal steps this requires. Under UK GDPR Art 9, you must document a specific Art 9(2) condition AND complete a DPIA before processing. Failure to do this is automatically unlawful regardless of your Art 6 basis. Action: Complete Phase 3 Q2, use the DPIA Template tool, and update the Data Register with Art 9(2) conditions.",
    medium: "Special category data processing steps are partially in place. Ensure DPIAs are completed and Art 9(2) conditions are documented.",
    low: "Special category data controls are in place.",
  },
  breachReady: {
    high: "Your organisation is not prepared to respond to a data breach. UK GDPR Art 33 requires you to report qualifying breaches to the ICO within 72 hours of becoming aware. Without a named Incident Lead, a written procedure, a breach register, and a notification template, you will almost certainly miss this deadline if a breach occurs. The ICO has issued fines specifically for late or missing breach notifications. Action: Complete Phase 6 and fill in the Incident Response Plan tool immediately.",
    medium: "Some breach readiness gaps remain. Ensure your Incident Response Plan is complete and displayed at your premises.",
    low: "Breach readiness controls are in place. Run a tabletop exercise to test them.",
  },
  processorContracts: {
    high: "Your organisation is sharing personal data with third-party suppliers (till provider, IT support, payroll, etc.) without written Data Processing Agreements (DPAs). Under UK GDPR Art 28, a signed DPA is legally required with every processor before they handle any personal data. Without DPAs, you are jointly liable for any data breach caused by those suppliers. Action: Complete Phase 4 Q6 and use the Key Contacts tool to list every processor.",
    medium: "Some processor agreements may be missing. Identify any suppliers not yet covered and obtain signed DPAs.",
    low: "Processor contracts are documented.",
  },
  retention: {
    high: "Your organisation does not have a documented policy for how long personal data is kept. UK GDPR Art 5(1)(e) requires data to be deleted when it is no longer needed. Keeping data indefinitely is a breach of the storage limitation principle and an enforcement risk. Action: Complete Phase 1 Q4, Phase 4 Q3, and review the Retention Schedule tool.",
    medium: "Retention documentation is partially in place. Review the Retention Schedule and ensure it is applied consistently.",
    low: "Retention controls are documented.",
  },
  security: {
    high: "Your organisation has not carried out a formal risk assessment for the personal data it holds. UK GDPR Art 32 requires appropriate technical and organisational security measures. Without a risk assessment, you cannot demonstrate compliance and are exposed to enforcement action after any incident. Action: Complete Phase 3 Q1 and Phase 5 Q3.",
    medium: "Security measures are partially assessed. Ensure backup arrangements are documented and tested.",
    low: "Security measures and risk assessment are in place.",
  },
  subjectRights: {
    high: "Your organisation does not have written processes for responding to individuals' data rights requests. UK GDPR gives individuals rights to access, erase and correct their data. You are legally required to respond to Subject Access Requests within one calendar month. Failure to respond can trigger ICO enforcement. Action: Complete Phase 4 Q4, Q5 and Q8.",
    medium: "Some data subject rights processes need strengthening. Ensure SAR and erasure procedures are written down.",
    low: "Data subject rights processes are in place.",
  },
  training: {
    high: "Staff and volunteers have not been trained on data protection. Human error is the leading cause of personal data breaches — misdirected emails, lost devices, wrong file shares. Without training, your organisation is highly exposed to preventable incidents. The ICO considers lack of staff training an aggravating factor when assessing fines. Action: Complete Phase 4 Q7 and Phase 6 Q7.",
    medium: "Training may be incomplete for some staff or volunteers. Ensure all staff have received at least a basic briefing.",
    low: "Staff training is in place.",
  },
};

function complianceAssessment(pct, answered) {
  if(answered===0) return {meaning:"Complete the phase questions to calculate your compliance status.",actions:"Work through each phase in order, beginning with Phase 1 (Context)."};
  if(pct>=80) return {
    meaning:"Your organisation has addressed its core data protection obligations under UK GDPR, DPA 2018 and related legislation.",
    actions:"Schedule your next annual review. Run a tabletop exercise (Phase 7) if not already done. Check for law changes since your last review.",
  };
  if(pct>=40) return {
    meaning:"Your organisation has made progress but has compliance gaps that create legal risk. Some obligations may not currently be met.",
    actions:"Focus on phases still showing gaps. Review the Action Tracker for specific steps. Prioritise Critical and High items first.",
  };
  return {
    meaning:"Your organisation has significant compliance gaps and is currently exposed to enforcement action by the ICO. Some processing may be unlawful.",
    actions:"(1) Complete Phase 2 — assign a named data protection lead. (2) Complete Phase 6 — prepare your incident response procedure and ICO notification template. (3) Complete Phase 4 — put Data Processing Agreements in place. (4) Visit ico.org.uk/for-organisations/charity for free guidance.",
  };
}

function ComplianceReport({st, onNav}) {
  const overall=overallScore(st.answers);
  const t=tier(overall.pct,overall.answered);
  const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const assessment=complianceAssessment(overall.pct,overall.answered);

  const risks=RISK_AREAS.map(area=>{
    const rs=riskScore(area,st.answers);
    const expl=RISK_EXPLANATIONS[area.id]||{};
    const level=rs.level==="Critical"||rs.level==="High"?"high":rs.level==="Medium"?"medium":"low";
    return {...area, rs, explanation: expl[level]||area.desc};
  }).sort((a,b)=>{
    const order={"Critical":0,"High":1,"Medium":2,"Low":3,"Unknown":4};
    return (order[a.rs.level]||4)-(order[b.rs.level]||4);
  });

  const criticalAndHigh = risks.filter(r=>r.rs.level==="Critical"||r.rs.level==="High");
  const gapActions = ACTION_ITEMS.filter(a=>getAnsValue(st.answers,a.qid)==="no"&&(a.priority==="Critical"||a.priority==="High"));

  return (
    <>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}} className="no-print">
        <div>
          <div className="page-title">Compliance Report</div>
          <div className="page-sub">Plain-English summary of your legal position — for trustees, management or auditors</div>
        </div>
        <button onClick={()=>window.print()} style={{fontFamily:"var(--mono)",fontSize:11,color:"#fff",background:"var(--t1)",border:"none",borderRadius:6,padding:"9px 18px",cursor:"pointer",flexShrink:0}}>
          🖨 Print / Save as PDF
        </button>
      </div>

      <div className="report-inner" style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:10,padding:"28px 32px"}}>

        {/* Header */}
        <div style={{borderBottom:"2px solid var(--t1)",paddingBottom:14,marginBottom:22}}>
          <div style={{fontFamily:"var(--serif)",fontSize:22,marginBottom:5}}>{st.charityName||"[Charity Name]"}</div>
          <div style={{fontFamily:"var(--serif)",fontSize:16,color:"var(--t2)",marginBottom:10}}>Data Protection Compliance Report</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>Date: {today}</span>
            {st.icoNumber&&<span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>ICO Reg: {st.icoNumber}</span>}
            {st.dpName&&<span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>Data Protection Lead: {st.dpName}</span>}
          </div>
        </div>

        {/* Section 1 — Overall verdict */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".08em",color:"var(--t3)",marginBottom:10,paddingBottom:5,borderBottom:"1px solid var(--b2)"}}>Section 1 — Overall Compliance Status</div>
          <div className="score-row" style={{display:"flex",alignItems:"center",gap:16,padding:"16px",background:t.bg,border:`1.5px solid ${t.border}`,borderRadius:8,marginBottom:14}}>
            <div className="score-ring-wrap" style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ring pct={overall.pct} size={80} stroke={7}/>
              <div style={{position:"absolute",textAlign:"center"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:overall.answered>0?17:13,fontWeight:700,color:t.fg,lineHeight:1}}>
                  {overall.answered>0?`${overall.pct}%`:"—"}
                </div>
                {overall.answered>0&&<div style={{fontFamily:"var(--mono)",fontSize:7,color:t.fg+"99",letterSpacing:".05em",marginTop:2,textTransform:"uppercase"}}>compliant</div>}
              </div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"var(--mono)",fontSize:15,fontWeight:700,color:t.fg,marginBottom:4}}>{t.icon} {t.label} — {overall.pct}%</div>
              <div style={{fontSize:12.5,color:"var(--t1)",lineHeight:1.6,marginBottom:8}}>{assessment.meaning}</div>
              {/* Overall stacked progress bar — same as dashboard */}
              {overall.answered>0 && (()=>{
                const totalQ=PHASES.reduce((s,p)=>s+p.questions.length,0);
                const yesN=Object.values(st.answers).filter(a=>(a?.value||a)==="yes").length;
                const inpN=Object.values(st.answers).filter(a=>(a?.value||a)==="in_progress").length;
                const noN =Object.values(st.answers).filter(a=>(a?.value||a)==="no").length;
                const naN =Object.values(st.answers).filter(a=>(a?.value||a)==="not_applicable").length;
                const unN =totalQ-overall.answered;
                const bars=[
                  {n:yesN,c:"#15803d",l:"Compliant"},
                  {n:inpN,c:"#f59e0b",l:"In progress"},
                  {n:noN, c:"#ef4444",l:"Action required"},
                  {n:naN, c:"#9ca3af",l:"Not applicable"},
                  ...(unN>0?[{n:unN,c:"#d1d5db",l:"Not yet answered"}]:[]),
                ];
                return (
                  <>
                    <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",marginBottom:8,gap:1}}>
                      {bars.map((b,i)=>b.n>0&&<div key={i} style={{flex:b.n,background:b.c,minWidth:2,transition:"flex .5s ease"}}/>)}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"5px 14px",marginBottom:6}}>
                      {bars.filter(b=>b.n>0).map(b=>(
                        <div key={b.l} style={{display:"flex",alignItems:"center",gap:4}}>
                          <div style={{width:8,height:8,borderRadius:2,background:b.c,flexShrink:0}}/>
                          <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t2)"}}><strong style={{color:b.c}}>{b.n}</strong> {b.l}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)",marginTop:8}}>{overall.complete}/{overall.applicable} controls confirmed complete · {overall.total-overall.answered} questions not yet answered</div>
            </div>
          </div>
          <div className="report-phase-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0",border:"1px solid var(--b)",borderRadius:8,overflow:"hidden"}}>
            {PHASES.map((p,i)=>{
              const sc=phaseScore(p,st.answers);
              const hasGap=p.questions.some(q=>getAnsValue(st.answers,q.id)==="no");
              const statusColor=sc.answered===0?"#9ca3af":hasGap?"#b91c1c":sc.pct===100?"#15803d":"#b45309";
              const statusLabel=sc.answered===0?"Not started":hasGap?"Action required":sc.pct===100?"Complete":"In progress";
              return (
                <div key={p.id} style={{
                  padding:"12px 14px",
                  borderBottom: i < PHASES.length-2 ? "1px solid var(--b2)" : "none",
                  borderRight:  i%2===0 ? "1px solid var(--b2)" : "none",
                  background:   sc.answered===0 ? "var(--bg)" : "var(--card)",
                  cursor:"pointer",
                  transition:"background .12s",
                }}
                  onMouseEnter={e=>{ if(sc.answered>0) e.currentTarget.style.background="#fafaf8"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=sc.answered===0?"var(--bg)":"var(--card)"; }}
                >                  <div style={{fontFamily:"var(--mono)",fontSize:8.5,color:"var(--t3)",marginBottom:2}}>Phase 0{p.id}</div>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:6}}>{p.name}</div>
                  {/* Progress bar with % label */}
                  <div style={{position:"relative",height:18,background:"var(--b2)",borderRadius:4,overflow:"hidden",marginBottom:4}}>
                    <div style={{
                      position:"absolute",left:0,top:0,bottom:0,
                      width:`${sc.pct}%`,background:arcColor(sc.pct),
                      borderRadius:4,transition:"width .5s ease",minWidth:sc.pct>0?2:0,
                    }}/>
                    <div style={{
                      position:"absolute",inset:0,
                      display:"flex",alignItems:"center",paddingLeft:7,
                      fontFamily:"var(--mono)",fontSize:9,fontWeight:600,
                      color: sc.pct>18?"#fff":arcColor(sc.pct),
                    }}>
                      {sc.answered===0?"Not started":`${sc.pct}%`}
                    </div>
                    {sc.pct>0 && sc.pct<100 && (
                      <div style={{
                        position:"absolute",right:7,top:0,bottom:0,
                        display:"flex",alignItems:"center",
                        fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",
                      }}>
                        {sc.answered}/{p.questions.length}
                      </div>
                    )}
                  </div>
                  <div style={{fontFamily:"var(--mono)",fontSize:9,color:statusColor}}>{statusLabel}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2 — Legal risk exposures */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".08em",color:"var(--t3)",marginBottom:10,paddingBottom:5,borderBottom:"1px solid var(--b2)"}}>Section 2 — Legal Risk Exposures</div>
          <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.6,marginBottom:14}}>
            The following table shows the legal risks your organisation currently faces based on your answers. Each risk is assessed against UK GDPR, DPA 2018 and related legislation.
          </div>
          {risks.map(area=>(
            <div key={area.id} style={{borderLeft:`4px solid ${area.rs.color}`,background:area.rs.bg,borderRadius:"0 8px 8px 0",padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                <div style={{fontFamily:"var(--mono)",fontSize:9,fontWeight:700,color:area.rs.color,background:area.rs.color+"20",padding:"2px 8px",borderRadius:99,border:`1px solid ${area.rs.color}44`}}>{area.rs.level} Risk</div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--t1)"}}>{area.label}</div>
              </div>
              <div style={{fontSize:12,color:"var(--t1)",lineHeight:1.65}}>{area.explanation}</div>
            </div>
          ))}
        </div>

        {/* Section 3 — Priority actions */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".08em",color:"var(--t3)",marginBottom:10,paddingBottom:5,borderBottom:"1px solid var(--b2)"}}>Section 3 — Priority Actions</div>
          {overall.answered===0 ? (
            <div style={{fontSize:12.5,color:"var(--t2)"}}>Complete the phase questions to generate your priority action list.</div>
          ) : gapActions.length===0 ? (
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"14px 16px",fontSize:12.5,color:"#15803d"}}>✓ No Critical or High priority gaps identified based on current answers. Continue to Phase 7 to schedule your annual review.</div>
          ) : (
            <>
              <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.6,marginBottom:14}}>
                The following actions must be completed to address your most significant legal gaps. These are ordered by priority.
              </div>
              {["Critical","High"].map(pri=>{
                const items=gapActions.filter(a=>a.priority===pri);
                if(items.length===0) return null;
                return (
                  <div key={pri} style={{marginBottom:16}}>
                    <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:pri==="Critical"?"#b91c1c":"#9a3412",marginBottom:8}}>{pri} priority</div>
                    {items.map((a,i)=>(
                      <div key={a.code} style={{display:"flex",gap:12,padding:"10px 14px",background:"var(--bg)",border:"1px solid var(--b)",borderRadius:7,marginBottom:6,alignItems:"flex-start"}}>
                        <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)",flexShrink:0,width:55,paddingTop:1}}>{a.code}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12.5,fontWeight:600,color:"var(--t1)",marginBottom:3}}>{a.desc}</div>
                          <div style={{fontSize:11.5,color:"var(--t2)"}}>{a.phase}</div>
                        </div>
                        <div style={{width:18,height:18,border:"1.5px solid var(--b)",borderRadius:3,flexShrink:0,marginTop:1}}/>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Section 4 — Incident history */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".08em",color:"var(--t3)",marginBottom:10,paddingBottom:5,borderBottom:"1px solid var(--b2)"}}>Section 4 — Incident Register Summary</div>
          <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.7}}>
            {st.breachState?.length>0
              ? <>{st.breachState.length} incident{st.breachState.length===1?"":"s"} recorded · {st.breachState.filter(b=>b.reportedICO==="Yes").length} reported to ICO · {st.breachState.filter(b=>b.status==="Open").length} currently open · {st.breachState.filter(b=>b.status==="Closed").length} closed</>
              : "No incidents have been recorded in the Breach Register."}
          </div>
        </div>

        {/* Sign-off */}
        <div style={{marginBottom:8}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".08em",color:"var(--t3)",marginBottom:14,paddingBottom:5,borderBottom:"1px solid var(--b2)"}}>Sign-off</div>
          <div className="signoff-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {["Prepared by","Reviewed by","Approved by","Date of next review"].map(label=>(
              <div key={label}>
                <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginBottom:4}}>{label}</div>
                <div style={{borderBottom:"1px solid var(--b)",height:28}}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginTop:16,borderTop:"1px solid var(--b2)",paddingTop:10}}>
          Generated by DPIRF · UK Charities · ISO 22301 · Mapped against UK GDPR · DPA 2018 · DUAA 2025 · EU CRA 2024
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INSTRUCTIONS
═══════════════════════════════════════════════════════════════ */
function Instructions({onNav, answers}) {
  const steps = [
    {num:"1", emoji:"📝", title:"Tell us about your charity", desc:"Enter your charity name, ICO number and who is responsible for data protection.", action:"Start Phase 1", v:1, time:"5 min"},
    {num:"2", emoji:"🏛", title:"Confirm your leadership", desc:"Make sure someone is named as your data protection lead and your policy is approved.", action:"Go to Phase 2", v:2, time:"5 min"},
    {num:"3", emoji:"🔍", title:"Check your risks", desc:"Tell us whether you've assessed your data risks and done privacy checks before new systems.", action:"Go to Phase 3", v:3, time:"10 min"},
    {num:"4", emoji:"📄", title:"Put documents in place", desc:"Privacy notices, supplier agreements, staff training — make sure the basics are covered.", action:"Go to Phase 4", v:4, time:"10 min"},
    {num:"5", emoji:"⚡", title:"Protect your critical activities", desc:"What would happen if your systems went down? Make sure your most important data is backed up.", action:"Go to Phase 5", v:5, time:"10 min"},
    {num:"6", emoji:"🚨", title:"Prepare for a breach", desc:"The most important phase. Make sure you could respond to a data breach within 72 hours.", action:"Go to Phase 6", v:6, time:"15 min"},
    {num:"7", emoji:"📅", title:"Schedule your annual review", desc:"Set a date to review your data protection arrangements every year.", action:"Go to Phase 7", v:7, time:"5 min"},
    {num:"8", emoji:"✅", title:"Close the loop", desc:"Make sure any gaps you've found lead to real action and get fixed.", action:"Go to Phase 8", v:8, time:"5 min"},
  ];

  const tools = [
    {emoji:"📋", title:"Documentation Checklist", desc:"Track the 15 documents UK law requires you to have.", v:"doc-checklist"},
    {emoji:"🗓", title:"Retention Schedule", desc:"How long should you keep different types of data? All pre-filled.", v:"retention"},
    {emoji:"🗄", title:"Data Register", desc:"A record of every type of personal data your charity holds.", v:"data-register"},
    {emoji:"⚖️", title:"DPIA Template", desc:"The privacy risk assessment form required for high-risk activities.", v:"dpia"},
    {emoji:"🧯", title:"Incident Response Plan", desc:"Print this and put it on the wall. Your step-by-step guide if something goes wrong.", v:"irp"},
    {emoji:"📞", title:"Key Contacts", desc:"Print this and display it. Who to call in an emergency.", v:"key-contacts"},
    {emoji:"✔️", title:"Action Tracker", desc:"Your live to-do list. See exactly what still needs doing.", v:"action-tracker"},
    {emoji:"📗", title:"Breach Register", desc:"Required by law — log every data incident, even small ones.", v:"breach-register"},
    {emoji:"🎯", title:"Scenario Simulator", desc:"Practice your breach response with your team. Takes 30 minutes.", v:"scenario-sim"},
    {emoji:"📊", title:"Compliance Report", desc:"A printable summary to share with trustees or management.", v:"compliance-report"},
  ];

  const toolsUnlocked = allPhaseQuestionsAnswered(answers);

  return (
    <>
      {/* Welcome banner */}
      <div style={{background:"var(--t1)",borderRadius:12,padding:"28px 32px",marginBottom:20,color:"#fff"}}>
        <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".1em",opacity:0.5,marginBottom:8}}>
          UK Charities · ISO 22301 · UK GDPR · DPA 2018 · DUAA 2025
        </div>
        <div style={{fontFamily:"var(--serif)",fontSize:26,lineHeight:1.25,marginBottom:8}}>Data Privacy Incident Response Framework</div>
        <div style={{fontSize:14,opacity:0.75,lineHeight:1.6,maxWidth:560}}>
          This tool helps your charity meet its UK data protection obligations — step by step, in plain English. You do not need to be a legal expert to use it.
        </div>
        <button onClick={()=>onNav(1)} style={{marginTop:16,fontFamily:"var(--sans)",fontSize:13,fontWeight:600,color:"var(--t1)",background:"#fff",border:"none",borderRadius:7,padding:"10px 20px",cursor:"pointer"}}>
          Start with Phase 1 →
        </button>
      </div>

      {/* How it works */}
      <div className="sec-label">How it works — 8 phases, about 1 hour total</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,240px),1fr))",gap:9,marginBottom:20}}>
        {steps.map((s, idx)=> {
          // Sequential lock logic: phase is unlocked if:
          // - It's Phase 1 (always unlocked), OR
          // - All questions in the PREVIOUS phase have been answered
          const prevPhase = idx > 0 ? PHASES[idx - 1] : null;
          const prevAllAnswered = prevPhase
            ? prevPhase.questions.every(q => getAnsValue(answers, q.id))
            : true;
          const isLocked = idx > 0 && !prevAllAnswered;

          return (
            <div key={s.num} onClick={isLocked ? undefined : ()=>onNav(s.v)} style={{
              background:"var(--card)",
              border:"1px solid var(--b)",
              borderRadius:9,
              padding:"14px 16px",
              cursor: isLocked ? "not-allowed" : "pointer",
              transition:"border-color .12s,transform .12s",
              opacity: isLocked ? 0.6 : 1,
              filter: isLocked ? "grayscale(50%)" : "none"
            }}
              onMouseEnter={isLocked ? undefined : e=>{e.currentTarget.style.borderColor="var(--t1)";e.currentTarget.style.transform="translateY(-1px)"}}
              onMouseLeave={isLocked ? undefined : e=>{e.currentTarget.style.borderColor="var(--b)";e.currentTarget.style.transform=""}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                <div style={{fontSize:20,lineHeight:1}}>{isLocked ? "🔒" : s.emoji}</div>
                <div>
                  <div style={{fontFamily:"var(--mono)",fontSize:8.5,color:"var(--t3)",marginBottom:1}}>Phase {s.num} · ~{s.time}</div>
                  <div style={{fontSize:12.5,fontWeight:700,color:"var(--t1)"}}>{s.title}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.5,marginBottom:10}}>{s.desc}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:9.5,color:"var(--t3)"}}>
                {isLocked ? "Complete Phase " + (idx) + " to unlock" : s.action + " →"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tools */}
      <div className="sec-label">Tools — complete after the phases</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,180px),1fr))",gap:8,marginBottom:20}}>
        {tools.map(t=>(
          <div key={t.v} onClick={toolsUnlocked ? ()=>onNav(t.v) : undefined} style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"13px 15px",cursor:toolsUnlocked ? "pointer" : "not-allowed",transition:"border-color .12s",opacity:toolsUnlocked ? 1 : 0.6,filter:toolsUnlocked ? "none" : "grayscale(50%)"}}
            onMouseEnter={toolsUnlocked ? e=>e.currentTarget.style.borderColor="var(--t1)" : undefined}
            onMouseLeave={toolsUnlocked ? e=>e.currentTarget.style.borderColor="var(--b)" : undefined}
            title={toolsUnlocked ? t.title : "Complete all 8 phases to unlock tools"}>
            <div style={{fontSize:18,marginBottom:6}}>{toolsUnlocked ? t.emoji : "🔒"}</div>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t1)",marginBottom:4}}>{t.title}</div>
            <div style={{fontSize:11,color:"var(--t3)",lineHeight:1.45}}>{t.desc}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:9.5,color:"var(--t3)",marginTop:8}}>
              {toolsUnlocked ? "Open tool →" : "Complete all 8 phases to unlock"}
            </div>
          </div>
        ))}
      </div>

      {/* Tips for non-technical users */}
      <div className="sec-label">Tips for getting started</div>
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:10,padding:"18px 20px",marginBottom:16}}>
        {[
          {emoji:"💾", tip:"Your answers save automatically. You can close and come back at any time."},
          {emoji:"❓", tip:"Every question has a \"What does this mean?\" button. Click it if you're unsure."},
          {emoji:"✏️", tip:"If you're not sure, answer \"In progress\" — you can update it later."},
          {emoji:"👥", tip:"You don't have to do this alone. Share the Compliance Report with trustees or colleagues."},
          {emoji:"🖨", tip:"The Incident Response Plan and Key Contacts can be printed and put on the wall."},
        ].map((t,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"9px 0",borderBottom:i<4?"1px solid var(--b2)":"none",alignItems:"flex-start"}}>
            <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{t.emoji}</span>
            <span style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.55}}>{t.tip}</span>
          </div>
        ))}
      </div>

      {/* Key definitions — collapsed by default, expandable */}
      <KeyTermsToggle />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KEY TERMS TOGGLE  (collapsed by default)
═══════════════════════════════════════════════════════════════ */
function KeyTermsToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{marginBottom:8}}>
      {/* Toggle header — always visible */}
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{
          width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"var(--card)",border:"1px solid var(--b)",borderRadius:open?"9px 9px 0 0":"9px",
          padding:"12px 16px",cursor:"pointer",transition:"border-radius .15s",
          fontFamily:"var(--sans)",
        }}
      >
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>📖</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>Key Legal Terms &amp; References</div>
            <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>
              {open?"Click to collapse":"35 terms across 7 categories — legislation, rights, roles, incidents and more"}
            </div>
          </div>
        </div>
        <span style={{
          fontFamily:"var(--mono)",fontSize:11,color:"var(--t3)",
          transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0,
        }}>▼</span>
      </button>

      {/* Expandable content */}
      {open && (
        <div style={{border:"1px solid var(--b)",borderTop:"none",borderRadius:"0 0 9px 9px",background:"var(--card)",padding:"16px 16px 8px"}}>
          <KeyTerms />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KEY TERMS  (searchable, categorised definitions)
═══════════════════════════════════════════════════════════════ */
const DEF_CATEGORIES = ["All","Legislation","Core concept","Key document","Role","Data subject right","Incident","Security"];

function KeyTerms() {
  const [query,setQuery] = useState("");
  const [cat,setCat]     = useState("All");
  const [showRefs,setShowRefs] = useState(false);

  const filtered = DEFINITIONS.filter(d=>{
    const matchCat = cat==="All" || d.cat===cat;
    const q = query.toLowerCase();
    const matchQ = !q || d.term.toLowerCase().includes(q) || d.meaning.toLowerCase().includes(q) || d.ref.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const catColors = {
    "Legislation":      {bg:"#eff6ff",fg:"#1d4ed8",border:"#bfdbfe"},
    "Core concept":     {bg:"#f5f3ff",fg:"#6d28d9",border:"#ddd6fe"},
    "Key document":     {bg:"#fff7ed",fg:"#c2410c",border:"#fed7aa"},
    "Role":             {bg:"#f0fdf4",fg:"#15803d",border:"#86efac"},
    "Data subject right":{bg:"#ecfdf5",fg:"#047857",border:"#6ee7b7"},
    "Incident":         {bg:"#fef2f2",fg:"#b91c1c",border:"#fca5a5"},
    "Security":         {bg:"#fafafa",fg:"#374151",border:"#d1d5db"},
  };

  return (
    <>
      {/* Search + category filter + refs toggle */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search terms…"
          onFocus={e=>e.target.style.borderColor="var(--t1)"}
          onBlur={e=>e.target.style.borderColor="var(--b)"}
          style={{fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b)",borderRadius:6,padding:"6px 10px",outline:"none",flex:"1 1 160px",minWidth:120,transition:"border-color .15s"}}
        />
        <button onClick={()=>setShowRefs(s=>!s)}
          style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".05em",padding:"5px 10px",border:"1px solid",borderRadius:5,cursor:"pointer",transition:"all .12s",whiteSpace:"nowrap",
            borderColor: showRefs?"var(--t1)":"var(--b2)",
            background:  showRefs?"var(--t1)":"var(--bg)",
            color:       showRefs?"#fff":"var(--t3)",
          }}>
          {showRefs?"Hide legal refs":"Show legal refs"}
        </button>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {DEF_CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".05em",padding:"4px 9px",border:"1px solid",borderRadius:5,cursor:"pointer",transition:"all .12s",
                borderColor: cat===c?"var(--t1)":"var(--b2)",
                background:  cat===c?"var(--t1)":"var(--bg)",
                color:       cat===c?"#fff":"var(--t3)",
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0 && (
        <div style={{textAlign:"center",padding:"28px 0",fontSize:12,color:"var(--t3)"}}>No terms match your search.</div>
      )}

      {/* Group by category */}
      {DEF_CATEGORIES.slice(1).map(category=>{
        const items = filtered.filter(d=>d.cat===category);
        if(items.length===0) return null;
        const cc = catColors[category]||{bg:"var(--bg)",fg:"var(--t2)",border:"var(--b2)"};
        return (
          <div key={category} style={{marginBottom:16}}>
            {/* Category header */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontFamily:"var(--mono)",fontSize:8.5,textTransform:"uppercase",letterSpacing:".09em",fontWeight:600,
                color:cc.fg,background:cc.bg,border:`1px solid ${cc.border}`,borderRadius:4,padding:"2px 8px"}}>
                {category}
              </span>
              <div style={{flex:1,height:"1px",background:"var(--b2)"}}/>
              <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)"}}>{items.length} term{items.length!==1?"s":""}</span>
            </div>

            {/* Terms */}
            <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,overflow:"hidden"}}>
              {items.map((d,idx)=>(
                <div key={d.term} className="kt-row" style={{display:"grid",gridTemplateColumns:"200px 1fr",borderBottom:idx<items.length-1?"1px solid var(--b2)":"none"}}>
                  <div className="kt-term" style={{padding:"12px 14px",borderRight:"1px solid var(--b2)",background:cc.bg+"66"}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:"var(--t1)",marginBottom:showRefs?4:0,lineHeight:1.3}}>{d.term}</div>
                    {showRefs && (
                      <div style={{fontFamily:"var(--mono)",fontSize:8.5,color:cc.fg,background:cc.bg,border:`1px solid ${cc.border}`,
                        borderRadius:3,padding:"2px 6px",display:"inline-block",lineHeight:1.5,maxWidth:"100%",wordBreak:"break-word"}}>
                        {d.ref}
                      </div>
                    )}
                  </div>
                  <div style={{padding:"12px 14px",fontSize:12,color:"var(--t2)",lineHeight:1.65}}>
                    {d.meaning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer note */}
      <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginTop:4,marginBottom:20,lineHeight:1.6}}>
        All references are to UK law as applicable from 1 January 2021. EU CRA 2024 applies from September 2026.
        This glossary does not constitute legal advice — consult a qualified solicitor for specific guidance.
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORG DETAILS BLOCK
═══════════════════════════════════════════════════════════════ */
function OrgDetailsBlock({fields,values,onChange}) {
  return (
    <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:12}}>
      <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".09em",color:"var(--t3)",marginBottom:12,paddingBottom:6,borderBottom:"1px solid var(--b2)"}}>
        Organisation Details
      </div>
      {fields.map(f=>{
        const filled=!!(values[f.key]&&values[f.key].trim());
        return (
          <div key={f.key} style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)"}}>{f.label}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:8.5,color:"var(--t3)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:3,padding:"1px 5px"}}>{f.ref}</div>
              <div style={{marginLeft:"auto",fontFamily:"var(--mono)",fontSize:9,color:filled?"#15803d":"#9ca3af",fontWeight:600}}>{filled?"✓ Complete":"—"}</div>
            </div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:4,lineHeight:1.4}}>{f.guidance}</div>
            {f.multiline
              ? <textarea style={{width:"100%",minHeight:72,fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"8px 10px",outline:"none",resize:"vertical",lineHeight:1.5}}
                  placeholder={f.placeholder} value={values[f.key]||""} onChange={e=>onChange(f.key,e.target.value)}/>
              : <input style={{width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"7px 10px",outline:"none"}}
                  placeholder={f.placeholder} value={values[f.key]||""} onChange={e=>onChange(f.key,e.target.value)}/>
            }
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHASE VIEW  (with evidence capture, conditional workflows)
═══════════════════════════════════════════════════════════════ */
function PhaseView({phase,answers,setAns,guidance,toggleG,evidenceOpen,toggleEv,onNav,st,upd}) {
  const sc=phaseScore(phase,answers);
  const hasSpecialCat=getAnsValue(answers,"c1_3")==="yes";

  const orgFields={
    1:[
      {key:"charityName",label:"Organisation name",ref:"CTX-0a",placeholder:"Legal name as registered with the Charity Commission",guidance:"Enter the legal name of your charity as registered with the Charity Commission.",multiline:false},
      {key:"icoNumber",label:"ICO registration number",ref:"CTX-0b",placeholder:"e.g. ZA123456",guidance:"Check your registration at ico.org.uk",multiline:false},
    ],
    2:[
      {key:"dpName",label:"Named data protection lead",ref:"LDR-0",placeholder:"Full name of the person assigned as data protection lead",guidance:"Enter the full name of the person assigned as data protection lead.",multiline:false},
    ],
    5:[
      {key:"criticalActivities",label:"What are your most important day-to-day activities?",ref:"BIA-0a",placeholder:"e.g. Processing donations, managing volunteer rotas, running the till…",guidance:"Think about what your charity could not do without.",multiline:true},
      {key:"dataDependencies",label:"What personal information do those activities rely on?",ref:"BIA-0b",placeholder:"e.g. Donor bank details, volunteer contact lists, beneficiary health records…",guidance:"For each activity above, write down what personal information it uses.",multiline:true},
    ],
  };
  const fields=orgFields[phase.id];

  // Conditional workflow alerts per phase
  const showDpiaAlert=hasSpecialCat&&(phase.id===3||phase.id===5);
  const showArt9Alert=hasSpecialCat&&phase.id===1;

  return (
    <>
      <div className="ph-label">Phase 0{phase.id} of 08</div>
      <div className="ph-title">{phase.name}</div>
      <div className="ph-desc">{phase.desc}</div>
      <div className="std-badge"><span style={{opacity:.4}}>§</span>{phase.std}</div>

      {/* Conditional workflow alerts */}
      {showArt9Alert && (
        <div className="workflow-alert wf-high">
          <span style={{fontSize:14,flexShrink:0}}>📋</span>
          <div style={{fontSize:12,color:"#92400e",lineHeight:1.55}}>
            <strong>Special category data selected.</strong> You must document an Art 9(2) condition for each type in your Data Register, and complete a DPIA before processing begins. These requirements activate automatically when Q3 is answered "Yes".
          </div>
        </div>
      )}
      {showDpiaAlert && (
        <div className="workflow-alert wf-high">
          <span style={{fontSize:14,flexShrink:0}}>⚠</span>
          <div style={{fontSize:12,color:"#92400e",lineHeight:1.55}}>
            <strong>DPIA required.</strong> Because you collect special category data, a Data Protection Impact Assessment is <em>mandatory</em> for all high-risk processing activities in this phase. Use the{" "}
            <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>onNav("dpia")}>DPIA Template tab</span>.
          </div>
        </div>
      )}

      {fields && (
        <OrgDetailsBlock fields={fields} values={st} onChange={(k,v)=>upd(k,v)}/>
      )}

      {/* Progress */}
      <div className="ph-prog">
        <div className="ph-prog-bar"><div className="ph-prog-fill" style={{width:`${sc.pct}%`}}/></div>
        <div className="ph-prog-txt">{sc.answered}/{phase.questions.length} answered · {sc.pct}%</div>
      </div>

      {/* Questions */}
      {phase.questions.map((q,i)=>{
        const ansObj=answers[q.id]||{};
        const val=ansObj.value;
        const cls=val?`ans-${val}`:"";
        const showGuide=guidance[q.id];
        const showEvidence=evidenceOpen[q.id];
        const hasEvidence=ansObj.evidenceNote||ansObj.approvedBy||ansObj.approvedDate;
        return (
          <div key={q.id} className={`qc ${cls}`}>
            <div className="qc-top">
              <div className="qc-num">{i+1}</div>
              <div className="qc-body">
                {/* Simplified: question text first, guidance collapsed */}
                <div className="qc-text">{q.text}</div>
                <div className="qc-opts">
                  {OPTS.map(o=>(
                    <button key={o.value} className={`qc-opt ${o.cls} ${val===o.value?"sel":""}`}
                      onClick={()=>setAns(q.id,"value",o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>

                {/* Guidance — collapsed by default */}
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4,flexWrap:"wrap"}}>
                  <button className="qc-g-btn" onClick={()=>toggleG(q.id)}>
                    {showGuide?"▲ Hide guidance":"▾ What does this mean?"}
                  </button>
                  {val && (
                    <button className={`evidence-badge ${hasEvidence?"filled":""}`} onClick={()=>toggleEv(q.id)}>
                      {hasEvidence?"✓ Evidence recorded":"+ Add evidence / approval"}
                    </button>
                  )}
                </div>

                {showGuide && (
                  <div className="qc-guide">{q.guidance}</div>
                )}
                {val==="no" && q.action && (
                  <div className="action-box">⚠ Action required: {q.action}</div>
                )}
                {val==="in_progress" && q.action && (
                  <div className="action-box action-box-prog">◑ In progress: {q.action}</div>
                )}

                {/* Evidence / approval panel */}
                {showEvidence && (
                  <div className="evidence-panel">
                    <div style={{fontFamily:"var(--mono)",fontSize:8.5,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:8}}>Evidence & Approval Metadata</div>
                    <div className="evidence-row">
                      <div>
                        <div className="evidence-label">Evidence note / document reference</div>
                        <input className="evidence-in" placeholder="e.g. Policy v2.1 signed 01/04/2026, stored in SharePoint…"
                          value={ansObj.evidenceNote||""} onChange={e=>setAns(q.id,"evidenceNote",e.target.value)}/>
                      </div>
                      <div>
                        <div className="evidence-label">Approved by</div>
                        <input className="evidence-in" placeholder="Full name and role…"
                          value={ansObj.approvedBy||""} onChange={e=>setAns(q.id,"approvedBy",e.target.value)}/>
                      </div>
                    </div>
                    <div className="evidence-row">
                      <div>
                        <div className="evidence-label">Date approved / confirmed</div>
                        <input type="date" className="evidence-in"
                          value={ansObj.approvedDate||""} onChange={e=>setAns(q.id,"approvedDate",e.target.value)}/>
                      </div>
                      <div>
                        <div className="evidence-label">Version / review date</div>
                        <input className="evidence-in" placeholder="e.g. v1, next review Jan 2027…"
                          value={ansObj.version||""} onChange={e=>setAns(q.id,"version",e.target.value)}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Phase nav */}
      <div className="ph-nav">
        {phase.id>1
          ? <button className="ph-nav-btn" onClick={()=>onNav(phase.id-1)}>← Phase 0{phase.id-1}</button>
          : <div/>
        }
        <button className="ph-nav-btn" onClick={()=>onNav(phase.id)} style={{color:"var(--t3)",fontSize:10}}>↑ Top</button>
        {phase.id<8
          ? <button className="ph-nav-btn primary" onClick={()=>onNav(phase.id+1)}>Phase 0{phase.id+1} →</button>
          : <button className="ph-nav-btn primary" onClick={()=>onNav("dashboard")}>↑ Dashboard</button>
        }
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOC CHECKLIST
═══════════════════════════════════════════════════════════════ */
function DocChecklist({state,onChange,onNav}) {
  const update=(id,field,val)=>onChange({...state,[id]:{...state[id],[field]:val}});
  const complete=Object.values(state).filter(d=>d.status==="Complete").length;
  return (
    <>
      <div className="page-title">Documentation Checklist</div>
      <div className="page-sub">Track the 15 documents required under UK GDPR · {complete}/15 complete</div>
      <div className="tbl-responsive" style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:10,marginBottom:8}}>
        <table className="tool-table" style={{minWidth:780}}>
          <thead><tr><th>Document</th><th>Legal basis</th><th>Status</th><th>Implement by</th><th>Train by</th><th>Owner</th></tr></thead>
          <tbody>
            {DOC_CHECKLIST.map(d=>(
              <tr key={d.id}>
                <td style={{maxWidth:220}}>
                  <div style={{fontWeight:500,color:"var(--t1)",marginBottom:2}}>{d.name}</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)"}}>{d.basis}</div>
                  <div style={{fontSize:10,color:"var(--t3)",marginTop:3,lineHeight:1.4}}>{d.guidance}</div>
                </td>
                <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",whiteSpace:"nowrap"}}>{d.iso}</td>
                <td>
                  <select className="tbl-sel" value={state[d.id]?.status||"Not started"} onChange={e=>update(d.id,"status",e.target.value)}>
                    {["Not started","In progress","Complete","Not applicable"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </td>
                <td><input className="tbl-in" type="date" value={state[d.id]?.dateImpl||""} onChange={e=>update(d.id,"dateImpl",e.target.value)}/></td>
                <td><input className="tbl-in" type="date" value={state[d.id]?.dateTrain||""} onChange={e=>update(d.id,"dateTrain",e.target.value)}/></td>
                <td><input className="tbl-in" placeholder="Name…" value={state[d.id]?.owner||""} onChange={e=>update(d.id,"owner",e.target.value)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToolNav current="doc-checklist" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RETENTION SCHEDULE
═══════════════════════════════════════════════════════════════ */
function RetentionSchedule({state,onChange,onNav}) {
  const update=(id,val)=>onChange({...state,[id]:val});
  const groups=[
    {label:"R.1 — Statutory minimum periods",items:RETENTION.filter(r=>r.id.startsWith("r1"))},
    {label:"R.2 — Business / charity specific periods",items:RETENTION.filter(r=>r.id.startsWith("r2"))},
  ];
  return (
    <>
      <div className="page-title">Retention Schedule</div>
      <div className="page-sub">Statutory and recommended retention periods for 32 common charity data types. Set your adjusted period in the last column.</div>
      {groups.map(g=>(
        <div key={g.label} style={{marginBottom:16}}>
          <div className="sec-label">{g.label}</div>
          <div className="tbl-responsive" style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:10}}>
            <table className="tool-table" style={{minWidth:680}}>
              <thead><tr><th>Ref</th><th>Data type</th><th>Statutory period</th><th>Legal basis</th><th>Your adjusted period</th></tr></thead>
              <tbody>
                {g.items.map(r=>(
                  <tr key={r.id}>
                    <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",whiteSpace:"nowrap"}}>{r.ref}</td>
                    <td style={{fontWeight:500,color:"var(--t1)"}}>{r.name}</td>
                    <td style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)",whiteSpace:"nowrap"}}>{r.stat}</td>
                    <td style={{fontSize:10,color:"var(--t3)"}}>{r.note}</td>
                    <td><input className="tbl-in" placeholder="e.g. 3 years" value={state[r.id]||""} onChange={e=>update(r.id,e.target.value)}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <ToolNav current="retention" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA REGISTER  (Article 30 RoPA)
═══════════════════════════════════════════════════════════════ */
const DATA_REGISTER = [
  {id:"dr01",cat:"Donor personal contact details",type:"Donors",data:"Full name, address, email, phone number",cls:"Personal",purpose:"Fundraising communication and relationship management",basis:"Art 6(1)(f) — Legitimate interests",art9:"N/A",recipients:"Internal fundraising staff only",storage:"Donor CRM / database",geo:"Within UK/EU",retention:"3 years after last donation",dpia:"No",security:"Role-based access control; password-protected system"},
  {id:"dr02",cat:"Donor gift aid and financial records",type:"Donors",data:"NI number (partial), gift aid declaration, donation amounts and dates",cls:"Personal",purpose:"Reclaim Gift Aid from HMRC; financial reporting",basis:"Art 6(1)(c) — Legal obligation",art9:"N/A",recipients:"HMRC; Finance team; Gift Aid processor",storage:"Finance records / accountancy software",geo:"Within UK/EU",retention:"3 years after fiscal year end",dpia:"No",security:"Encryption at rest; restricted to finance team only"},
  {id:"dr03",cat:"Volunteer personal contact details",type:"Volunteers",data:"Full name, address, email, phone, emergency contact",cls:"Personal",purpose:"Volunteer scheduling, management and communication",basis:"Art 6(1)(b) — Contract (volunteering agreement)",art9:"N/A",recipients:"Operations team; designated volunteer coordinator",storage:"Volunteer management system or spreadsheet",geo:"Within UK/EU",retention:"1 year after leaving",dpia:"No",security:"Access restricted to operations team; password protected"},
  {id:"dr04",cat:"Volunteer health and DBS records",type:"Volunteers",data:"Health conditions affecting volunteering; DBS certificate number and status",cls:"Sensitive",purpose:"Safeguarding; legal compliance; duty of care",basis:"Art 6(1)(c) — Legal obligation",art9:"Art 9(2)(b) — Employment/social protection; DPA 2018 Sch 1",recipients:"Safeguarding lead; DBS provider",storage:"Secure HR file; locked physical storage",geo:"Within UK/EU",retention:"5 years after employment ends",dpia:"Yes",security:"Strict access control; named lead only; encrypted if digital"},
  {id:"dr05",cat:"Beneficiary personal contact details",type:"Beneficiaries",data:"Full name, address, email, phone, date of birth",cls:"Personal",purpose:"Service delivery; beneficiary welfare and follow-up",basis:"Art 6(1)(a) — Consent",art9:"N/A",recipients:"Service delivery staff; partner referral organisations (with consent)",storage:"Client management system",geo:"Within UK/EU",retention:"7 years",dpia:"No",security:"Access restricted to service delivery team; role-based permissions"},
  {id:"dr06",cat:"Beneficiary health and care data",type:"Beneficiaries",data:"Medical conditions, medication details, care plans, mental health information",cls:"Sensitive",purpose:"Safe delivery of care or support services",basis:"Art 6(1)(d) — Vital interests / Art 6(1)(a) — Consent",art9:"Art 9(2)(h) — Health/social care; Art 9(2)(c) — Vital interests",recipients:"Named care workers; GP with consent; social services if safeguarding",storage:"Secure case management system",geo:"Within UK/EU",retention:"7 years",dpia:"Yes",security:"End-to-end encryption; strict access control; no sharing without consent"},
  {id:"dr07",cat:"Employee/staff personnel records",type:"Employees",data:"Name, address, DOB, NI number, payroll, bank details, employment history, right to work",cls:"Personal",purpose:"Employment contract; legal obligations; payroll",basis:"Art 6(1)(b) — Contract; Art 6(1)(c) — Legal obligation",art9:"N/A",recipients:"HR team; payroll bureau; HMRC",storage:"HR system / personnel files",geo:"Within UK/EU",retention:"6 years after employment ends",dpia:"No",security:"HR system with role-based access; locked physical files; DPA with payroll bureau"},
  {id:"dr08",cat:"Employee health and absence records",type:"Employees",data:"Sickness absence dates, reason for absence, GP fit notes, occupational health reports",cls:"Sensitive",purpose:"Absence management; statutory sick pay; occupational health",basis:"Art 6(1)(b) — Contract; Art 6(1)(c) — Legal obligation",art9:"Art 9(2)(b) — Employment, social security and social protection",recipients:"HR manager; line manager; occupational health provider",storage:"HR system; locked physical HR file",geo:"Within UK/EU",retention:"6 years",dpia:"No",security:"Access restricted to HR and line manager only; encrypted if digital"},
  {id:"dr09",cat:"Trustee governance records",type:"Trustees / Board Members",data:"Full name, address, date of appointment, proof of eligibility, meeting minutes",cls:"Personal",purpose:"Legal governance obligations; Charity Commission reporting",basis:"Art 6(1)(c) — Legal obligation",art9:"N/A",recipients:"Charity Commission; internal board secretary",storage:"Board governance records / minute books",geo:"Within UK/EU",retention:"Permanently",dpia:"No",security:"Access restricted to board secretary and CEO; locked storage"},
  {id:"dr10",cat:"Marketing consent and campaign data",type:"Donors / Supporters",data:"Email address, contact preferences, opt-in date and method, campaign responses",cls:"Personal",purpose:"Marketing communications; fundraising appeals; newsletters",basis:"Art 6(1)(a) — Consent",art9:"N/A",recipients:"Marketing team; email platform provider (processor)",storage:"CRM / email marketing platform",geo:"Within UK/EU",retention:"6 months from campaign end",dpia:"No",security:"Consent records maintained; unsubscribe mechanism in place; DPA with email provider"},
  {id:"dr11",cat:"CCTV footage",type:"Staff / Visitors / Public",data:"Visual footage of individuals at charity premises",cls:"Personal",purpose:"Premises security; deterring and detecting crime",basis:"Art 6(1)(f) — Legitimate interests",art9:"N/A",recipients:"Named security lead; police (if crime reported)",storage:"On-site DVR / NVR system; cloud storage if applicable",geo:"Within UK/EU",retention:"31 days (review regularly)",dpia:"Yes",security:"Physical access control to DVR; retention limit enforced; DPIA completed; signage in place"},
  {id:"dr12",cat:"Website analytics and cookies",type:"Website Visitors",data:"IP addresses, browser type, pages visited, session duration",cls:"Personal",purpose:"Website performance monitoring; user experience improvement",basis:"Art 6(1)(f) — Legitimate interests (analytics); Art 6(1)(a) — Consent (marketing cookies)",art9:"N/A",recipients:"Analytics platform provider (e.g. Google Analytics)",storage:"Analytics platform (third party)",geo:"Outside UK/EU (if US provider)",retention:"26 months maximum",dpia:"No",security:"Cookie consent banner in place; privacy policy updated; DPA with analytics provider"},
];

function DataRegister({charityName, icoNumber, onNav}) {
  const [open, setOpen] = useState(null);
  const clsColor = c => c==="Sensitive"?"#b91c1c":"#0369a1";
  const clsBg    = c => c==="Sensitive"?"#fef2f2":"#eff6ff";
  return (
    <>
      <div className="page-title">Data Register</div>
      <div className="page-sub">Article 30 Record of Processing Activities (RoPA) · Pre-populated with 12 common charity scenarios · UK GDPR Art 30</div>
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"12px 16px",marginBottom:12,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
        {[
          {label:"Controller name", val:charityName, hint:"Complete in Phase 1"},
          {label:"ICO registration", val:icoNumber, hint:"Complete in Phase 1"},
          {label:"Register date", val:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}), hint:""},
        ].map(f=>(
          <div key={f.label}>
            <div style={{fontFamily:"var(--mono)",fontSize:8.5,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:3}}>{f.label}</div>
            <div style={{fontSize:13,fontWeight:f.val?600:400,color:f.val?"var(--t1)":"#9ca3af"}}>{f.val||<em style={{fontStyle:"normal"}}>{f.hint}</em>}</div>
          </div>
        ))}
      </div>
      {DATA_REGISTER.map(r=>(
        <div key={r.id} style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,marginBottom:7,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer"}} onClick={()=>setOpen(open===r.id?null:r.id)}>
            <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:3,padding:"2px 6px",flexShrink:0}}>{r.id.toUpperCase()}</span>
            <span style={{flex:1,fontSize:12.5,fontWeight:600,color:"var(--t1)"}}>{r.cat}</span>
            <span style={{fontSize:10,fontWeight:600,color:clsColor(r.cls),background:clsBg(r.cls),padding:"2px 7px",borderRadius:99,flexShrink:0}}>{r.cls}</span>
            <span style={{fontSize:11,color:"var(--t3)",marginLeft:4}}>{open===r.id?"▲":"▼"}</span>
          </div>
          {open===r.id && (
            <div style={{borderTop:"1px solid var(--b2)",padding:"14px 16px",overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,minWidth:300}}>
                <tbody>
                  {[
                    ["Individual Type",r.type],["Personal Data Included",r.data],
                    ["Processing Purpose",r.purpose],["Lawful Basis (Art 6)",r.basis],
                    ["Art 9 Condition",r.art9],["Third-Party Recipients",r.recipients],
                    ["Storage Location",r.storage],["Geographic Location",r.geo],
                    ["Retention Period",r.retention],["DPIA Required?",r.dpia],
                    ["Security Measures",r.security],
                  ].map(([k,v])=>(
                    <tr key={k}>
                      <td style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",padding:"5px 10px 5px 0",verticalAlign:"top",whiteSpace:"nowrap",width:140}}>{k}</td>
                      <td style={{color:"var(--t2)",padding:"5px 0",lineHeight:1.5}}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      <div style={{background:"var(--bg)",border:"1px dashed var(--b)",borderRadius:9,padding:"14px 16px",fontSize:12,color:"var(--t3)",textAlign:"center"}}>
        Review each row and update to match your actual processing. Add rows for any data types not listed above.
      </div>
      <ToolNav current="data-register" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DPIA TEMPLATE
═══════════════════════════════════════════════════════════════ */
function DpiaTemplate({state,activity,onChange,onActivity,charityName,onNav}) {
  const update=(step,field,val)=>onChange({...state,[`step${step}`]:{...state[`step${step}`],[field]:val}});
  const complete=Object.values(state).filter(s=>s.status==="Complete").length;
  return (
    <>
      <div className="page-title">DPIA Template</div>
      <div className="page-sub">7-step Data Protection Impact Assessment · {complete}/7 steps complete · Required by UK GDPR Art 35 before any high-risk processing</div>
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:14}}>
        <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:6}}>Processing activity being assessed</div>
        <input style={{width:"100%",fontFamily:"var(--sans)",fontSize:13,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"8px 11px",outline:"none"}}
          placeholder="e.g. Introduction of CCTV system at the charity shop entrance…"
          value={activity} onChange={e=>onActivity(e.target.value)}/>
      </div>
      {DPIA_STEPS.map(s=>{
        const st2=state[`step${s.step}`]||{response:"",status:"Not started"};
        return (
          <div key={s.step} className="step-card">
            <div className="step-header">
              <div className="step-num">Step {s.step}</div>
              <div style={{flex:1}}>
                <div className="step-title">{s.title}</div>
                <div className="step-guidance">{s.guidance}</div>
              </div>
              <select className="tbl-sel" value={st2.status} onChange={e=>update(s.step,"status",e.target.value)} style={{flexShrink:0}}>
                {["Not started","In progress","Complete"].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <textarea className="step-ta" rows={3} placeholder="Document your assessment here…"
              value={st2.response} onChange={e=>update(s.step,"response",e.target.value)}/>
          </div>
        );
      })}
      <ToolNav current="dpia" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IRP VIEW
═══════════════════════════════════════════════════════════════ */
function IrpView({state,onChange,charityName,icoNumber,dpName,onNav}) {
  const update=(step,val)=>onChange({...state,[`step${step}`]:val});
  return (
    <>
      <div className="page-title">Incident Response Plan</div>
      <div className="page-sub">Eight-step breach procedure · Complete the "Responsible person" column for each step · Print and display at all locations</div>
      <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#991b1b"}}>
        <strong>72-hour rule:</strong> The ICO notification clock starts the moment you become aware of a breach. Complete this plan <em>before</em> a breach occurs.
      </div>
      {IRP_STEPS.map(s=>(
        <div key={s.step} className="step-card">
          <div className="step-header">
            <div className="step-num">Step {s.step}</div>
            <div style={{flex:1}}>
              <div className="step-title">{s.action}</div>
              <div className="step-timeframe">⏱ {s.timeframe}</div>
              <div className="step-legal">{s.legal}</div>
              <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.55,margin:"8px 0"}}>{s.detail}</div>
            </div>
          </div>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:5}}>Responsible person at your organisation</div>
          <input style={{width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"7px 10px",outline:"none"}}
            placeholder="Full name and contact number…"
            value={state[`step${s.step}`]||""} onChange={e=>update(s.step,e.target.value)}/>
        </div>
      ))}
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:8}}>
        <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:8}}>ICO emergency contacts</div>
        <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7}}>
          ICO breach report portal: <strong>ico.org.uk/make-a-complaint</strong><br/>
          ICO helpline: <strong>0303 123 1113</strong><br/>
          {icoNumber&&<>Your ICO registration number: <strong>{icoNumber}</strong><br/></>}
          {dpName&&<>Your named data protection lead: <strong>{dpName}</strong></>}
        </div>
      </div>
      <ToolNav current="irp" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KEY CONTACTS
═══════════════════════════════════════════════════════════════ */
function KeyContactsView({state,onChange,charityName,icoNumber,dpName,onNav}) {
  const updC=(id,field,val)=>onChange({...state,contacts:{...state.contacts,[id]:{...state.contacts[id],[field]:val}}});
  const updP=(id,field,val)=>onChange({...state,processors:{...state.processors,[id]:{...state.processors[id],[field]:val}}});
  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:10}}>
        <div>
          <div className="page-title">Key Contacts</div>
          <div className="page-sub">Complete all fields, then print and laminate. Display at every location.</div>
        </div>
        <button onClick={()=>window.print()} className="no-print"
          style={{fontFamily:"var(--mono)",fontSize:11,color:"#fff",background:"var(--t1)",border:"none",borderRadius:6,padding:"8px 16px",cursor:"pointer",flexShrink:0}}>
          🖨 Print
        </button>
      </div>
      {charityName&&<div style={{fontFamily:"var(--sans)",fontSize:15,fontWeight:600,marginBottom:14}}>{charityName}{icoNumber?` · ICO: ${icoNumber}`:""}</div>}
      <div className="sec-label">Data Protection Contacts</div>
      <div className="kc-grid">
        {KEY_CONTACTS_ROLES.map(r=>(
          <div key={r.id} className="kc-card">
            <div><div className="kc-role">{r.role}</div><div className="kc-note">{r.notes}</div></div>
            {["name","phone","email"].map(f=>(
              <div key={f} className="kc-field">
                <div className="kc-flabel">{f.charAt(0).toUpperCase()+f.slice(1)}</div>
                <input className="kc-in" placeholder={f==="email"?"email@example.com":f==="phone"?"01234 567 890":"Full name…"}
                  value={state.contacts?.[r.id]?.[f]||""} onChange={e=>updC(r.id,f,e.target.value)}/>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sec-label">Data Processors</div>
      <div className="tbl-responsive" style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:10,marginBottom:8}}>
        <table className="tool-table" style={{minWidth:600}}>
          <thead><tr><th>Processor type</th><th>Company name</th><th>Phone</th><th>Email</th><th>DPA signed?</th></tr></thead>
          <tbody>
            {PROCESSOR_TYPES.map(p=>(
              <tr key={p.id}>
                <td style={{fontWeight:500,color:"var(--t1)"}}>{p.type}</td>
                {["company","phone","email"].map(f=>(
                  <td key={f}><input className="tbl-in" placeholder={f==="email"?"email…":f==="phone"?"phone…":"company name…"}
                    value={state.processors?.[p.id]?.[f]||""} onChange={e=>updP(p.id,f,e.target.value)}/></td>
                ))}
                <td>
                  <select className="tbl-sel" value={state.processors?.[p.id]?.dpa||"No"} onChange={e=>updP(p.id,"dpa",e.target.value)}>
                    {["No","In progress","Yes","Not applicable"].map(v=><option key={v}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToolNav current="key-contacts" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACTION TRACKER
═══════════════════════════════════════════════════════════════ */
function ActionTracker({answers,state,onChange,filter,setFilter,charityName,onNav}) {
  const update=(code,field,val)=>onChange({...state,[code]:{...state[code],[field]:val}});
  const pCls={Critical:"p-critical",High:"p-high",Medium:"p-medium",Low:"p-low"};

  const items=ACTION_ITEMS.map(a=>{
    const v=getAnsValue(answers,a.qid);
    const status=v==="yes"?"Complete":v==="in_progress"?"In progress":v==="no"?"Action required":v==="not_applicable"?"N/A":"Not answered";
    return {...a,status};
  });

  const filtered=filter==="all"?items:filter==="action"?items.filter(i=>i.status==="Action required"):
    filter==="inprogress"?items.filter(i=>i.status==="In progress"):
    filter==="complete"?items.filter(i=>i.status==="Complete"):items;

  const counts={action:items.filter(i=>i.status==="Action required").length, inprogress:items.filter(i=>i.status==="In progress").length, complete:items.filter(i=>i.status==="Complete").length};

  return (
    <>
      <div className="page-title">Action Tracker</div>
      <div className="page-sub">All compliance actions with live status. Assign a named owner and target date for each item.</div>
      <div className="at-filters">
        {[["all","All"],["action",`Action required (${counts.action})`],["inprogress",`In progress (${counts.inprogress})`],["complete",`Complete (${counts.complete})`]].map(([v,label])=>(
          <button key={v} className={`at-filter ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{label}</button>
        ))}
      </div>
      <div className="tbl-responsive" style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:10,marginBottom:8}}>
        <table className="tool-table" style={{minWidth:820}}>
          <thead><tr><th>Code</th><th>Action</th><th>Priority</th><th>Status</th><th>Owner</th><th>Target date</th><th>Notes</th></tr></thead>
          <tbody>
            {filtered.map(a=>{
              const st2=state[a.code]||{date:"",owner:"",notes:""};
              const sClsMap={"Complete":"s-complete","In progress":"s-inprogress","Action required":"s-notstarted","N/A":"s-na","Not answered":"s-notstarted"};
              return (
                <tr key={a.code}>
                  <td><div className="at-code">{a.code}</div></td>
                  <td style={{maxWidth:220}}>
                    <div style={{fontSize:12,color:"var(--t1)",fontWeight:500,marginBottom:2}}>{a.desc}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)"}}>{a.phase}</div>
                  </td>
                  <td><span className={`priority-badge ${pCls[a.priority]}`}>{a.priority}</span></td>
                  <td><span className={`status-badge ${sClsMap[a.status]||""}`}>{a.status}</span></td>
                  <td><input className="tbl-in" placeholder="Name…" value={st2.owner} onChange={e=>update(a.code,"owner",e.target.value)}/></td>
                  <td><input className="tbl-in" type="date" value={st2.date} onChange={e=>update(a.code,"date",e.target.value)}/></td>
                  <td><input className="tbl-in" placeholder="Notes…" value={st2.notes} onChange={e=>update(a.code,"notes",e.target.value)}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ToolNav current="action-tracker" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BREACH REGISTER
═══════════════════════════════════════════════════════════════ */
function BreachRegister({state,onChange,charityName,onNav}) {
  const entries=Array.isArray(state)?state:[];
  const [showForm,setShowForm]=useState(false);
  const [editIdx,setEditIdx]=useState(null);
  const blank={date:"",description:"",dataInvolved:"",affected:"",riskLevel:"Low",status:"Open",reportedICO:"No",icoRef:"",reportedIndividuals:"No",action:"",notes:""};
  const [form,setForm]=useState(blank);
  const updF=(k,v)=>setForm(p=>({...p,[k]:v}));
  const save=()=>{
    if(!form.date||!form.description) return;
    if(editIdx!==null){const n=[...entries];n[editIdx]=form;onChange(n);}
    else onChange([...entries,form]);
    setShowForm(false);setEditIdx(null);setForm(blank);
  };
  const edit=i=>{setEditIdx(i);setForm({...entries[i]});setShowForm(true);};
  const del=i=>{const n=entries.filter((_,idx)=>idx!==i);onChange(n);};
  const riskColor=r=>r==="High"?"#b91c1c":r==="Medium"?"#b45309":"#15803d";
  const riskBg=r=>r==="High"?"#fef2f2":r==="Medium"?"#fffbeb":"#f0fdf4";
  const statusColor=s=>s==="Closed"?"#15803d":s==="Under Review"?"#b45309":"#2563eb";
  const taStyle={width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"7px 10px",outline:"none",resize:"vertical"};
  const inStyle={width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"7px 10px",outline:"none"};
  const lbl=t=><div style={{fontFamily:"var(--mono)",fontSize:8.5,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:4}}>{t}</div>;

  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:10}}>
        <div>
          <div className="page-title">Breach Register</div>
          <div className="page-sub">Log all personal data incidents — UK GDPR Art 33(5) requires this even for breaches not reported to the ICO.</div>
        </div>
        <button onClick={()=>{setShowForm(true);setEditIdx(null);setForm(blank);}} className="no-print"
          style={{fontFamily:"var(--mono)",fontSize:10,color:"#fff",background:"var(--t1)",border:"none",borderRadius:6,padding:"8px 16px",cursor:"pointer",flexShrink:0}}>
          + Log incident
        </button>
      </div>
      {showForm&&(
        <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:10,padding:"18px",marginBottom:12}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:14}}>{editIdx!==null?"Edit Incident":"Log New Incident"}</div>
          <div className="breach-form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div>{lbl("Date of incident")}<input type="date" style={inStyle} value={form.date} onChange={e=>updF("date",e.target.value)}/></div>
            <div>{lbl("Risk level")}<select style={{...inStyle,cursor:"pointer"}} value={form.riskLevel} onChange={e=>updF("riskLevel",e.target.value)}>{["Low","Medium","High"].map(v=><option key={v}>{v}</option>)}</select></div>
            <div style={{gridColumn:"span 2"}}>{lbl("Description of incident")}<textarea rows={2} style={taStyle} value={form.description} onChange={e=>updF("description",e.target.value)} placeholder="What happened?"/></div>
            <div>{lbl("Data involved")}<input style={inStyle} value={form.dataInvolved} onChange={e=>updF("dataInvolved",e.target.value)} placeholder="e.g. Names, emails…"/></div>
            <div>{lbl("Individuals affected (number)")}<input type="number" style={inStyle} value={form.affected} onChange={e=>updF("affected",e.target.value)} placeholder="e.g. 45"/></div>
            <div>{lbl("Status")}<select style={{...inStyle,cursor:"pointer"}} value={form.status} onChange={e=>updF("status",e.target.value)}>{["Open","Under Review","Closed"].map(v=><option key={v}>{v}</option>)}</select></div>
            <div>{lbl("Reported to ICO?")}<select style={{...inStyle,cursor:"pointer"}} value={form.reportedICO} onChange={e=>updF("reportedICO",e.target.value)}>{["No","Yes"].map(v=><option key={v}>{v}</option>)}</select></div>
            {form.reportedICO==="Yes"&&<div>{lbl("ICO reference number")}<input style={inStyle} value={form.icoRef} onChange={e=>updF("icoRef",e.target.value)} placeholder="ICO ref…"/></div>}
            <div>{lbl("Individuals notified?")}<select style={{...inStyle,cursor:"pointer"}} value={form.reportedIndividuals} onChange={e=>updF("reportedIndividuals",e.target.value)}>{["No","Yes"].map(v=><option key={v}>{v}</option>)}</select></div>
            <div style={{gridColumn:"span 2"}}>{lbl("Actions taken / containment")}<textarea rows={2} style={taStyle} value={form.action} onChange={e=>updF("action",e.target.value)} placeholder="e.g. Email recalled, passwords changed…"/></div>
            <div style={{gridColumn:"span 2"}}>{lbl("Notes / lessons learned")}<textarea rows={2} style={taStyle} value={form.notes} onChange={e=>updF("notes",e.target.value)} placeholder="e.g. Root cause, procedure updated…"/></div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={save} style={{fontFamily:"var(--sans)",fontSize:12,fontWeight:600,color:"#fff",background:"var(--t1)",border:"none",borderRadius:6,padding:"8px 16px",cursor:"pointer"}}>
              {editIdx!==null?"Save Changes":"Add to Register"}
            </button>
            <button onClick={()=>{setShowForm(false);setEditIdx(null);setForm(blank);}} style={{fontFamily:"var(--sans)",fontSize:12,color:"var(--t2)",background:"none",border:"1px solid var(--b)",borderRadius:6,padding:"8px 14px",cursor:"pointer"}}>Cancel</button>
            {(!form.date||!form.description)&&<span style={{fontFamily:"var(--mono)",fontSize:10,color:"#b91c1c"}}>Date and description required</span>}
          </div>
        </div>
      )}
      {entries.length===0?(
        <div style={{background:"var(--bg)",border:"1px dashed var(--b)",borderRadius:9,padding:"32px 20px",textAlign:"center",color:"var(--t3)",fontSize:12}}>
          No incidents logged yet. All personal data breaches — including low-risk ones not reported to the ICO — must be recorded here.
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {entries.map((e,i)=>(
            <div key={i} style={{background:"var(--card)",border:"1px solid var(--b)",borderLeft:`3px solid ${riskColor(e.riskLevel)}`,borderRadius:9,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)"}}>{e.date||"No date"}</span>
                    <span style={{fontFamily:"var(--mono)",fontSize:9,fontWeight:700,color:riskColor(e.riskLevel),background:riskBg(e.riskLevel),padding:"1px 7px",borderRadius:99}}>{e.riskLevel} risk</span>
                    <span style={{fontFamily:"var(--mono)",fontSize:9,color:statusColor(e.status),padding:"1px 7px",borderRadius:99,background:e.status==="Closed"?"#f0fdf4":e.status==="Under Review"?"#fffbeb":"#eff6ff"}}>{e.status}</span>
                    {e.reportedICO==="Yes"&&<span style={{fontFamily:"var(--mono)",fontSize:9,color:"#7c3aed",background:"#f5f3ff",padding:"1px 7px",borderRadius:99}}>ICO reported{e.icoRef?` · ${e.icoRef}`:""}</span>}
                    {e.reportedIndividuals==="Yes"&&<span style={{fontFamily:"var(--mono)",fontSize:9,color:"#0369a1",background:"#eff6ff",padding:"1px 7px",borderRadius:99}}>Individuals notified</span>}
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:4}}>{e.description}</div>
                  {e.dataInvolved&&<div style={{fontSize:11.5,color:"var(--t2)",marginBottom:3}}><strong>Data:</strong> {e.dataInvolved}{e.affected?` · ${e.affected} individual${e.affected!=="1"?"s":""}`:""}</div>}
                  {e.action&&<div style={{fontSize:11,color:"var(--t3)",marginTop:5,lineHeight:1.5}}><strong style={{color:"var(--t2)"}}>Actions:</strong> {e.action}</div>}
                  {e.notes&&<div style={{fontSize:11,color:"var(--t3)",marginTop:3,lineHeight:1.5}}><strong style={{color:"var(--t2)"}}>Notes:</strong> {e.notes}</div>}
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}} className="no-print">
                  <button onClick={()=>edit(i)} style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",background:"none",border:"1px solid var(--b2)",borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>Edit</button>
                  <button onClick={()=>del(i)} style={{fontFamily:"var(--mono)",fontSize:9,color:"#b91c1c",background:"none",border:"1px solid #fecaca",borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToolNav current="breach-register" onNav={onNav}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENARIO SIMULATOR  (new — tabletop exercises)
═══════════════════════════════════════════════════════════════ */
function ScenarioSimulator({state,onChange,onNav}) {
  const [selected,setSelected]=useState(null);
  const [step,setStep]=useState(0); // 0=select, 1=running, 2=debrief
  const [responses,setResponses]=useState({});
  const [inject1Shown,setInject1Shown]=useState(false);
  const [inject2Shown,setInject2Shown]=useState(false);
  const [lessonsText,setLessonsText]=useState("");
  const [gapsText,setGapsText]=useState("");

  const updState=(sid,field,val)=>onChange({...state,[sid]:{...(state[sid]||{}),[field]:val}});

  const startScenario=(s)=>{
    setSelected(s);
    setStep(1);
    setResponses({});
    setInject1Shown(false);
    setInject2Shown(false);
    const saved=state[s.id]||{};
    setLessonsText(saved.lessons||"");
    setGapsText(saved.gaps||"");
  };

  const finishExercise=()=>{
    updState(selected.id,"lessons",lessonsText);
    updState(selected.id,"gaps",gapsText);
    updState(selected.id,"lastRun",new Date().toISOString().slice(0,10));
    updState(selected.id,"responses",responses);
    setStep(0);
    setSelected(null);
  };

  const sevColor={Critical:"#b91c1c",High:"#b45309",Medium:"#b45309"};
  const sevBg={Critical:"#fef2f2",High:"#fff7ed",Medium:"#fffbeb"};

  if(step===1&&selected) return (
    <>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <button onClick={()=>{setStep(0);setSelected(null);}} style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",background:"none",border:"1px solid var(--b2)",borderRadius:4,padding:"3px 8px",cursor:"pointer"}}>← Back</button>
        <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)"}}>Tabletop Exercise — {selected.category}</div>
      </div>
      <div className="page-title">{selected.title}</div>
      <div style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:99,fontFamily:"var(--mono)",fontSize:9,fontWeight:700,color:sevColor[selected.severity],background:sevBg[selected.severity],border:`1px solid ${sevColor[selected.severity]}55`,marginBottom:16}}>
        {selected.severity} Severity
      </div>

      {/* Background */}
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"16px 18px",marginBottom:12}}>
        <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:8}}>Scenario Background</div>
        <div style={{fontSize:13,color:"var(--t1)",lineHeight:1.65}}>{selected.background}</div>
      </div>

      {/* IRP steps coverage */}
      <div style={{background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:8,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontFamily:"var(--mono)",fontSize:8.5,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:8}}>IRP Steps Covered in This Exercise</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {selected.irpSteps.map(s=>(
            <span key={s} style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t1)",background:"var(--card)",border:"1px solid var(--b)",borderRadius:4,padding:"3px 8px"}}>{s}</span>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:8}}>Discussion Questions</div>
      {selected.questions.map((q,i)=>(
        <div key={i} style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:500,color:"var(--t1)",marginBottom:8}}>{i+1}. {q}</div>
          <textarea rows={3} style={{width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"8px 10px",outline:"none",resize:"vertical",lineHeight:1.5}}
            placeholder="Record your team's response here…"
            value={responses[i]||""} onChange={e=>setResponses(p=>({...p,[i]:e.target.value}))}/>
        </div>
      ))}

      {/* Injects */}
      <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:8}}>Scenario Injects</div>
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:8}}>
        {!inject1Shown?(
          <button onClick={()=>setInject1Shown(true)} style={{fontFamily:"var(--mono)",fontSize:10,color:"#fff",background:"#b45309",border:"none",borderRadius:5,padding:"7px 14px",cursor:"pointer"}}>
            Reveal Inject 1
          </button>
        ):(
          <>
            <div style={{fontFamily:"var(--mono)",fontSize:8.5,textTransform:"uppercase",letterSpacing:".07em",color:"#b45309",marginBottom:6}}>Inject 1 — New development</div>
            <div style={{fontSize:13,color:"var(--t1)",lineHeight:1.6,marginBottom:8}}>{selected.inject1}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginBottom:4}}>How does this change your response?</div>
            <textarea rows={2} style={{width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"8px 10px",outline:"none",resize:"vertical"}}
              placeholder="Record your team's response to inject 1…"
              value={responses["inj1"]||""} onChange={e=>setResponses(p=>({...p,inj1:e.target.value}))}/>
          </>
        )}
      </div>
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:12}}>
        {!inject2Shown?(
          <button onClick={()=>setInject2Shown(true)} style={{fontFamily:"var(--mono)",fontSize:10,color:"#fff",background:"#b91c1c",border:"none",borderRadius:5,padding:"7px 14px",cursor:"pointer"}}>
            Reveal Inject 2
          </button>
        ):(
          <>
            <div style={{fontFamily:"var(--mono)",fontSize:8.5,textTransform:"uppercase",letterSpacing:".07em",color:"#b91c1c",marginBottom:6}}>Inject 2 — Escalation</div>
            <div style={{fontSize:13,color:"var(--t1)",lineHeight:1.6,marginBottom:8}}>{selected.inject2}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginBottom:4}}>How does this change your response?</div>
            <textarea rows={2} style={{width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"8px 10px",outline:"none",resize:"vertical"}}
              placeholder="Record your team's response to inject 2…"
              value={responses["inj2"]||""} onChange={e=>setResponses(p=>({...p,inj2:e.target.value}))}/>
          </>
        )}
      </div>

      {/* Debrief */}
      <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:8}}>Debrief & Lessons Learned</div>
      <div style={{background:"var(--card)",border:"1px solid var(--b)",borderRadius:9,padding:"14px 16px",marginBottom:12}}>
        <div style={{marginBottom:10}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:5}}>Gaps / weaknesses identified</div>
          <textarea rows={3} style={{width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"8px 10px",outline:"none",resize:"vertical",lineHeight:1.5}}
            placeholder="e.g. IRP not accessible to all staff, no backup contact identified, 72-hour rule not understood…"
            value={gapsText} onChange={e=>setGapsText(e.target.value)}/>
        </div>
        <div>
          <div style={{fontFamily:"var(--mono)",fontSize:9,textTransform:"uppercase",letterSpacing:".07em",color:"var(--t3)",marginBottom:5}}>Actions agreed / lessons learned</div>
          <textarea rows={3} style={{width:"100%",fontFamily:"var(--sans)",fontSize:12,color:"var(--t1)",background:"var(--bg)",border:"1px solid var(--b2)",borderRadius:6,padding:"8px 10px",outline:"none",resize:"vertical",lineHeight:1.5}}
            placeholder="e.g. Print IRP and display at till, add backup contact to key contacts card, run quarterly drill…"
            value={lessonsText} onChange={e=>setLessonsText(e.target.value)}/>
        </div>
      </div>

      <div style={{display:"flex",gap:10}}>
        <button onClick={finishExercise} style={{fontFamily:"var(--sans)",fontSize:12,fontWeight:600,color:"#fff",background:"var(--t1)",border:"none",borderRadius:6,padding:"10px 20px",cursor:"pointer"}}>
          ✓ Save & Complete Exercise
        </button>
        <button onClick={()=>{setStep(0);setSelected(null);}} style={{fontFamily:"var(--sans)",fontSize:12,color:"var(--t2)",background:"none",border:"1px solid var(--b)",borderRadius:6,padding:"10px 16px",cursor:"pointer"}}>
          Cancel
        </button>
      </div>
    </>
  );

  // Scenario selection screen
  return (
    <>
      <div className="page-title">Scenario Simulator</div>
      <div className="page-sub">Run tabletop breach exercises and record lessons learned directly in the framework. Each scenario takes approximately 30–45 minutes with your team.</div>
      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#1d4ed8",lineHeight:1.55}}>
        <strong>How to use:</strong> Select a scenario, gather your team, and work through the discussion questions together. Reveal the injects at natural pauses. Record your responses and complete the debrief section. Saved exercises update Phase 7 (Performance Evaluation).
      </div>

      {TABLETOP_SCENARIOS.map(s=>{
        const saved=state[s.id]||{};
        const wasRun=!!saved.lastRun;
        return (
          <div key={s.id} className="scenario-card" style={{border:`1px solid ${wasRun?"#86efac":"var(--b)"}`,background:wasRun?"#f0fdf4":"var(--card)"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,justifyContent:"space-between",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"var(--mono)",fontSize:9,fontWeight:700,color:sevColor[s.severity]||"var(--t3)",background:sevBg[s.severity]||"var(--bg)",border:`1px solid ${(sevColor[s.severity]||"var(--b)")}55`,padding:"2px 8px",borderRadius:99}}>{s.severity}</span>
                  <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",background:"var(--bg)",border:"1px solid var(--b2)",padding:"2px 8px",borderRadius:99}}>{s.category}</span>
                  {wasRun&&<span style={{fontFamily:"var(--mono)",fontSize:9,color:"#15803d",background:"#f0fdf4",border:"1px solid #86efac",padding:"2px 8px",borderRadius:99}}>✓ Last run: {saved.lastRun}</span>}
                </div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--t1)",marginBottom:4}}>{s.title}</div>
                <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.5,marginBottom:8}}>{s.background.slice(0,140)}…</div>
                <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)"}}>{s.questions.length} discussion questions · 2 injects · covers {s.irpSteps.length} IRP steps</div>
                {wasRun&&saved.gaps&&(
                  <div style={{marginTop:8,padding:"6px 10px",background:"var(--bg)",borderRadius:5,border:"1px solid var(--b2)"}}>
                    <div style={{fontFamily:"var(--mono)",fontSize:8,textTransform:"uppercase",letterSpacing:".06em",color:"var(--t3)",marginBottom:3}}>Last gaps recorded</div>
                    <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.4}}>{saved.gaps.slice(0,120)}{saved.gaps.length>120?"…":""}</div>
                  </div>
                )}
              </div>
              <button onClick={()=>startScenario(s)}
                style={{fontFamily:"var(--mono)",fontSize:10,color:"#fff",background:"var(--t1)",border:"none",borderRadius:6,padding:"8px 16px",cursor:"pointer",flexShrink:0,marginTop:4}}>
                {wasRun?"Run Again":"Start Exercise"}
              </button>
            </div>
          </div>
        );
      })}
      <ToolNav current="scenario-sim" onNav={onNav}/>
    </>
  );
}
