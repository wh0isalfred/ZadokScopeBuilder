export const catalog = [
  {
    "id": "foundation",
    "title": "Digital foundation and public website",
    "price": 112000,
    "category": "foundation",
    "dependencies": [],
    "inclusions": [
      "business and workflow interpretation",
      "website and system architecture",
      "approved logo integration",
      "Zadok colour, typography and interface system",
      "homepage and required public information pages",
      "desktop, tablet and mobile experiences",
      "mobile bottom navigation",
      "foundational motion and interaction design",
      "accessibility fundamentals",
      "technical SEO and social sharing metadata",
      "performance and image optimisation",
      "secure Supabase and Vercel configuration",
      "validation and security foundations",
      "browser and responsive testing",
      "deployment and launch configuration",
      "staff handover",
      "30 days of post-launch bug correction"
    ],
    "value": "The public presence and technical groundwork for Zadok.",
    "warning": "The final Zadok logo will be supplied separately. This scope covers its professional implementation across the website and system.",
    "provisional": false
  },
  {
    "id": "catalogue",
    "title": "Produce catalogue management",
    "price": 45000,
    "category": "launch",
    "dependencies": [
      "foundation"
    ],
    "inclusions": [
      "create and edit products",
      "product image uploads",
      "prices and selling units",
      "product categories",
      "available, limited and unavailable states",
      "publish and hide controls",
      "seasonal and fresh-harvest indicators",
      "customer-facing filters and availability presentation"
    ],
    "value": "Keep produce, pricing and seasonal availability up to date.",
    "warning": "",
    "provisional": false
  },
  {
    "id": "basket",
    "title": "Basket and WhatsApp order requests",
    "price": 50000,
    "category": "launch",
    "dependencies": [
      "catalogue"
    ],
    "inclusions": [
      "add products to basket",
      "quantity controls",
      "basket persistence on the customer\u2019s device",
      "customer request details",
      "fulfilment preference",
      "unique order reference",
      "WhatsApp handoff with a prepared order message",
      "clear communication that submission is a request and not payment or final stock confirmation"
    ],
    "value": "Turn product interest into organised WhatsApp requests.",
    "warning": "",
    "provisional": false
  },
  {
    "id": "records",
    "title": "Customer and order records",
    "price": 35000,
    "category": "launch",
    "dependencies": [
      "basket",
      "staff"
    ],
    "inclusions": [
      "submitted request records",
      "search by customer, phone number or reference",
      "requested products and quantities",
      "order status management",
      "retained customer contact information",
      "repeat-customer visibility",
      "authorised internal notes",
      "customer request history",
      "requested, confirmed, awaiting payment, paid, fulfilled and cancelled workflow states"
    ],
    "value": "Keep customer context and every order request together.",
    "warning": "",
    "provisional": false
  },
  {
    "id": "staff",
    "title": "Staff portal and access control",
    "price": 55000,
    "category": "launch",
    "dependencies": [
      "foundation"
    ],
    "inclusions": [
      "secure staff sign-in",
      "administrator and staff permissions",
      "individual staff identities",
      "permission management",
      "mobile-friendly internal screens",
      "protected routes and server-side authorisation",
      "attribution of important changes",
      "profile and session management"
    ],
    "value": "Give each member of staff the access they need.",
    "warning": "",
    "provisional": false
  },
  {
    "id": "inventory",
    "title": "Inventory and harvest operations",
    "price": 55000,
    "category": "launch",
    "dependencies": [
      "catalogue",
      "staff"
    ],
    "inclusions": [
      "harvest records",
      "fulfilled-order adjustments",
      "spoilage records",
      "corrections",
      "physical stock counts",
      "projected available stock",
      "append-only adjustment history",
      "staff attribution",
      "relevant order links",
      "mobile field workflows",
      "safe weak-connectivity queuing and synchronisation without silent overwrites"
    ],
    "value": "Track harvests, adjustments and stock in the field.",
    "warning": "This provides operational stock visibility. It is not complete bookkeeping or accounting software.",
    "provisional": false
  },
  {
    "id": "training",
    "title": "Training programmes and applications",
    "price": 40000,
    "category": "launch",
    "dependencies": [
      "staff"
    ],
    "inclusions": [
      "create, edit, duplicate, publish and archive programmes",
      "programme imagery",
      "programme-specific formats and registration questions",
      "registration opening and closing",
      "application review",
      "approve and decline actions",
      "application communication",
      "retained applications linked to programmes",
      "public programme pages",
      "registration without customer accounts"
    ],
    "value": "Publish programmes and manage applications in one place.",
    "warning": "Excludes online classroom delivery, attendance management, examinations and digital certificates.",
    "provisional": false
  },
  {
    "id": "enquiries",
    "title": "Greenhouse and consulting enquiries",
    "price": 20000,
    "category": "launch",
    "dependencies": [
      "staff"
    ],
    "inclusions": [
      "greenhouse construction enquiries",
      "agricultural consulting enquiries",
      "relevant farm-service enquiries",
      "service-specific public forms",
      "spam and validation protection",
      "internal enquiry records",
      "enquiry-status management",
      "responsibility or assignment visibility where appropriate",
      "communication details for follow-up"
    ],
    "value": "Bring service enquiries into a clear follow-up process.",
    "warning": "",
    "provisional": false
  },
  {
    "id": "overview",
    "title": "Operational overview and exports",
    "price": 15000,
    "category": "launch",
    "dependencies": [
      "records"
    ],
    "inclusions": [
      "order-request overview",
      "order status counts",
      "recent inventory activity",
      "training and application summaries",
      "recent service enquiries",
      "filtered CSV exports where appropriate"
    ],
    "value": "See activity across the operational modules you select.",
    "warning": "This provides operational visibility. It does not replace professional financial accounting, tax or bookkeeping software. Summaries and exports cover only the operational modules selected.",
    "provisional": false
  },
  {
    "id": "delivery",
    "title": "Delivery map and delivery-area system",
    "price": 35000,
    "category": "addition",
    "dependencies": [
      "basket"
    ],
    "inclusions": [
      "delivery-location selection",
      "address or place search",
      "intentional current-location permission",
      "manual address fallback",
      "configured delivery areas",
      "internal delivery-location review"
    ],
    "value": "Capture delivery locations within agreed service areas.",
    "warning": "Delivery rules must first be confirmed. Third-party map-provider costs may apply.",
    "provisional": false
  },
  {
    "id": "payments",
    "title": "Online payment integration",
    "price": 50000,
    "category": "addition",
    "dependencies": [
      "records"
    ],
    "inclusions": [
      "approved payment provider",
      "secure payment initiation",
      "verified payment webhooks",
      "payment references",
      "reconciliation states",
      "customer payment confirmation"
    ],
    "value": "Accept and reconcile payments through an approved provider.",
    "warning": "This may be unnecessary while Zadok confirms orders and communicates payment details through WhatsApp.",
    "provisional": false
  },
  {
    "id": "accounts",
    "title": "Customer accounts and order history",
    "price": 40000,
    "category": "addition",
    "dependencies": [
      "records"
    ],
    "inclusions": [
      "customer registration and authentication",
      "saved contact details",
      "customer-facing request history",
      "repeat-order convenience",
      "account recovery",
      "privacy controls"
    ],
    "value": "Let returning customers access their request history.",
    "warning": "The current approved experience intentionally does not require customer accounts.",
    "provisional": false
  },
  {
    "id": "certificates",
    "title": "Training attendance and certificates",
    "price": 30000,
    "category": "addition",
    "dependencies": [
      "training"
    ],
    "inclusions": [
      "participant attendance",
      "completion status",
      "certificate eligibility",
      "certificate records",
      "digital certificate generation"
    ],
    "value": "Record participation and issue completion certificates.",
    "warning": "Zadok must first confirm its attendance and certification process.",
    "provisional": false
  },
  {
    "id": "accounting",
    "title": "Accounting-platform integration",
    "price": 45000,
    "category": "addition",
    "dependencies": [
      "foundation"
    ],
    "inclusions": [
      "Provider and API assessment",
      "Agreed integration scope with the selected accounting platform"
    ],
    "value": "Connect selected operations to an external accounting provider.",
    "warning": "Provisional starting amount. Final scope and price depend on the selected external accounting provider and available API.",
    "provisional": true
  },
  {
    "id": "outreach",
    "title": "Customer relationship and outreach tools",
    "price": 35000,
    "category": "addition",
    "dependencies": [
      "records"
    ],
    "inclusions": [
      "customer segmentation",
      "consent-based availability announcements",
      "gift or special-customer lists",
      "outreach history",
      "controlled exports for approved campaigns"
    ],
    "value": "Organise consent-based customer communication.",
    "warning": "Customer-consent and communication rules must first be confirmed.",
    "provisional": false
  },
  {
    "id": "assistant",
    "title": "AI support assistant",
    "price": 60000,
    "category": "addition",
    "dependencies": [
      "foundation"
    ],
    "inclusions": [
      "answers grounded only in approved Zadok information",
      "produce, training and service guidance",
      "WhatsApp escalation",
      "conversation safeguards",
      "usage protection",
      "cost tracking"
    ],
    "value": "Guide visitors using approved Zadok information.",
    "warning": "Ongoing model/API usage costs are separate. This works best after Zadok?s content has stabilised.",
    "provisional": false
  }
];
export const catalogVersion = "2026-09-v1";
