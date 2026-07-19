import type { LegalDocument } from '../types';

export const termsOfServiceEn: LegalDocument = {
  id: 'terms-of-service',
  locale: 'en',
  title: 'Terms of Service',
  subtitle:
    'These Terms of Service govern your access to and use of the AURA TECH website, mobile experiences, and related services for purchasing gaming products in Yemen and the broader Middle East region.',
  lastUpdated: 'March 19, 2026',
  intro: [
    'Welcome to AURA TECH. By accessing our website, creating an account, placing an order, uploading a payment receipt, or otherwise using our services, you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and any order-specific communications we provide. If you do not agree with these Terms in their entirety, you must not use our platform or complete a purchase through AURA TECH.',
    'AURA TECH operates as a gaming-focused e-commerce store serving customers in Yemen and select Middle East markets. Our business model relies exclusively on manual bank transfer payments, receipt verification, and administrative approval before orders are confirmed and fulfilled. These Terms explain how ordering works, what happens if payment is not approved within twenty-four (24) hours, how refunds are handled under our strict twenty-four (24) hour refund policy, and the limits of our liability. Please read them carefully before placing an order.',
  ],
  sections: [
    {
      id: 'agreement',
      title: '1. Agreement to Terms',
      paragraphs: [
        'These Terms constitute a legally binding agreement between you ("Customer," "you," or "your") and AURA TECH ("AURA TECH," "we," "us," or "our"). They apply to all visitors, registered users, and purchasers who interact with our storefront, customer support channels, or any related digital property operated under the AURA TECH brand.',
        'We may update these Terms from time to time to reflect changes in our payment workflow, shipping partners, product catalog, legal requirements, or business practices. When we make material changes, we will update the "Last Updated" date at the top of this page and, where appropriate, provide additional notice through the website or by email. Your continued use of our services after changes become effective constitutes acceptance of the revised Terms. If you disagree with an update, you should discontinue use of our services and resolve any open orders in accordance with the Terms in effect at the time of purchase.',
        'You represent that you are at least eighteen (18) years of age or the age of legal majority in your jurisdiction, whichever is higher, and that you have the legal capacity to enter into this agreement. If you are placing an order on behalf of a business or another individual, you represent that you are authorized to bind that entity or person to these Terms.',
        'Certain product categories, promotional offers, or regional delivery options may be subject to supplemental terms disclosed at checkout or on product pages. In the event of a conflict between supplemental terms and these general Terms, the supplemental terms will govern for that specific transaction unless explicitly stated otherwise.',
      ],
      bullets: [
        'Accessing the AURA TECH website or placing an order confirms your acceptance of these Terms.',
        'You are responsible for reviewing the current version of these Terms before each purchase.',
        'Account registration requires accurate contact and delivery information.',
        'We reserve the right to refuse service to anyone who violates these Terms or applicable law.',
      ],
    },
    {
      id: 'orders',
      title: '2. Orders and Order Acceptance',
      paragraphs: [
        'When you submit an order through AURA TECH, you are making an offer to purchase the selected products subject to these Terms, product availability, pricing at the time of checkout, and successful payment verification. An order is not confirmed, binding, or eligible for fulfillment until AURA TECH explicitly approves your payment and assigns the order a confirmed status in our system.',
        'All orders are subject to acceptance by AURA TECH. We may decline or cancel an order for reasons including but not limited to: product unavailability, pricing or description errors, suspected fraud, incomplete or illegible payment receipts, failure to meet payment deadlines, restrictions on shipping to your location, or violations of these Terms. If we cancel an order before payment approval, you will not be charged beyond any bank fees imposed by your financial institution, and no fulfillment obligation will arise.',
        'You are responsible for ensuring that your order details—including product model, variant, quantity, shipping address, and contact information—are accurate and complete at checkout. AURA TECH is not liable for delivery delays, failed deliveries, or additional costs arising from incorrect information provided by you. Material errors in order details discovered before shipment may be corrected by contacting support@auratechplus.com promptly; however, we cannot guarantee changes once payment review has advanced or inventory has been allocated.',
        'Order confirmation communications, shipping updates, and payment status notifications are sent to the email address associated with your account or checkout session. You agree to maintain a valid email address and to monitor communications related to your order, especially during the twenty-four (24) hour payment review window described in our Payment Terms.',
      ],
      ordered: [
        'Browse products and add eligible items to your cart.',
        'Proceed to checkout and review your order summary, shipping details, and total amount due.',
        'Select manual bank transfer as your payment method and note the bank account details provided by AURA TECH.',
        'Complete the bank transfer for the exact order total from your bank account.',
        'Upload a clear, legible copy of your payment receipt through the order page or designated upload channel.',
        'Wait for administrative payment review; your order remains pending until approved or automatically cancelled under our Payment Terms.',
        'Upon payment approval, receive order confirmation and proceed to fulfillment and shipping as described in these Terms.',
      ],
    },
    {
      id: 'payment-terms',
      title: '3. Payment Terms',
      callout: {
        title: 'Manual Bank Transfer Only — 24-Hour Payment Approval Window',
        body:
          'AURA TECH accepts payment exclusively via manual bank transfer. After you upload your payment receipt, our team will review it within twenty-four (24) hours. If your payment is not approved within that twenty-four (24) hour period, your order will be automatically cancelled without further notice. No order is confirmed until payment is explicitly approved by AURA TECH administration.',
      },
      paragraphs: [
        'All purchases on AURA TECH must be paid using manual bank transfer to the account details displayed at checkout or provided in your order instructions. We do not accept cash on delivery, credit cards, debit cards, digital wallets, cryptocurrency, or third-party payment processors at this time unless explicitly stated in a written offer from AURA TECH.',
        'You must transfer the exact order total shown at checkout, in the currency specified, and include any reference number or order identifier requested on the payment screen. Transfers that are incomplete, made to incorrect account details, or missing required references may delay or prevent payment approval. You are solely responsible for any fees charged by your bank or intermediary institutions.',
        'After completing your bank transfer, you must upload a payment receipt through the order interface. Acceptable receipts include bank transfer confirmations, mobile banking screenshots, or official deposit slips that clearly show the transfer date, amount, sender reference where applicable, and destination account. Blurry, cropped, altered, or incomplete uploads may require resubmission and can extend review time, but will not extend the twenty-four (24) hour automatic cancellation window unless we explicitly agree otherwise in writing.',
        'AURA TECH administrators review uploaded receipts during business operations and aim to complete review within twenty-four (24) hours of receipt upload. Payment approval confirms that we have verified your transfer against our records and allocated inventory for fulfillment. Payment rejection occurs when we cannot verify the transfer, detect a mismatch in amount or reference, suspect fraudulent activity, or identify other compliance concerns. If payment is rejected, you will be notified when possible and your order will not proceed to shipment.',
        'If payment is not approved within twenty-four (24) hours of your receipt upload—or within twenty-four (24) hours of order placement if no valid receipt is uploaded, whichever policy applies to your order state—your order will be automatically cancelled. Automatic cancellation releases reserved inventory and terminates the transaction without obligation on either party, except where a verified payment was received but not yet processed, in which case we will contact you to resolve the discrepancy or initiate a refund in accordance with our Refunds section.',
        'Approved payments are final with respect to order confirmation. Chargeback attempts, reversal disputes initiated without contacting AURA TECH support, or bad-faith payment claims may result in account suspension and denial of future orders.',
      ],
      bullets: [
        'Payment method: manual bank transfer only.',
        'Receipt upload is mandatory for payment verification.',
        'Administrative approval is required before any order is confirmed.',
        'Review target: within twenty-four (24) hours of valid receipt upload.',
        'Unapproved orders are automatically cancelled after twenty-four (24) hours.',
        'Contact support@auratechplus.com immediately if you believe your payment was sent correctly but not approved.',
      ],
    },
    {
      id: 'refunds',
      title: '4. Refunds',
      callout: {
        title: 'Critical: 24-Hour Refund Request Window',
        body:
          'All refund requests must be submitted within twenty-four (24) hours of payment approval or order confirmation, whichever occurs first. Refund requests received after this twenty-four (24) hour period will not be eligible for processing except where required by applicable law or expressly approved by AURA TECH management in writing for exceptional circumstances. This twenty-four (24) hour refund rule is strictly enforced.',
      },
      paragraphs: [
        'AURA TECH maintains a strict twenty-four (24) hour refund policy. You must submit any refund request within twenty-four (24) hours of the moment your payment is approved by our administration team or your order is confirmed, whichever timestamp occurs first in our system. The twenty-four (24) hour refund window begins immediately upon approval or confirmation and does not pause for weekends, holidays, or shipping delays unless we explicitly state otherwise in writing.',
        'Refund requests submitted after the twenty-four (24) hour period will ordinarily be denied. We enforce this policy because gaming products, accessories, and related inventory are often high-demand items with limited stock, and delayed refund requests interfere with inventory planning, fulfillment commitments, and fraud prevention. If you believe you are entitled to a refund after the twenty-four (24) hour window has closed, you must contact support@auratechplus.com with detailed documentation; such requests are reviewed on an exceptional basis only and are not guaranteed.',
        'To request a refund within the eligible twenty-four (24) hour window, email support@auratechplus.com from your registered account email with your order number, the reason for the refund request, and any supporting documentation. Refund requests must clearly reference the twenty-four (24) hour policy and confirm that the request is made within the permitted period. We will acknowledge eligible requests within our standard support response timeframe and process approved refunds back to the original bank transfer source where practicable.',
        'Approved refunds within the twenty-four (24) hour window will be processed after administrative verification. Refund timing depends on your bank and intermediary institutions; AURA TECH is not responsible for delays caused by financial networks once a refund transfer is initiated. Partial refunds may be issued where only a portion of an order is cancelled before shipment, provided the refund request complies with the twenty-four (24) hour rule.',
        'Orders that are automatically cancelled because payment was not approved within twenty-four (24) hours do not require a refund request if no verified payment was received. If a verified payment was received but the order was cancelled due to timeout, administrative error, or inventory unavailability, we will either confirm the order manually or initiate a full refund without requiring a customer refund request, subject to verification.',
        'Once an order has entered fulfillment, shipping, or delivery status, the twenty-four (24) hour refund window generally no longer applies. Post-fulfillment concerns must be directed to our Returns and Damaged Items section. By placing an order, you acknowledge that you have read, understood, and agree to the twenty-four (24) hour refund rule described in this section and in the callout above.',
      ],
      bullets: [
        'Refund requests must be submitted within twenty-four (24) hours of payment approval or order confirmation.',
        'Late refund requests are typically denied under our twenty-four (24) hour refund policy.',
        'Email support@auratechplus.com with your order number to initiate a eligible refund request.',
        'Refunds are returned via bank transfer to the original payment source where possible.',
        'Automatic cancellation for unapproved payment does not require a refund if no funds were verified.',
        'The twenty-four (24) hour refund rule applies regardless of product category unless law requires otherwise.',
      ],
    },
    {
      id: 'returns-damaged',
      title: '5. Returns and Damaged Items',
      paragraphs: [
        'AURA TECH distinguishes between refund requests governed by the twenty-four (24) hour refund policy in Section 4 and post-delivery returns or damage claims addressed in this section. Because our refund window is limited to twenty-four (24) hours from payment approval or order confirmation, most return requests after shipment will be evaluated under damage, defect, or mis-shipment standards rather than discretionary change-of-mind returns.',
        'If you receive a product that is damaged in transit, materially defective, or not the item listed on your order confirmation, you must notify support@auratechplus.com within forty-eight (48) hours of documented delivery with photographs, video where helpful, and a description of the issue. We may require return of the item or additional inspection evidence before offering replacement, repair coordination, or partial compensation.',
        'Change-of-mind returns, buyer remorse, compatibility misunderstandings, or failure to read product specifications are generally not accepted after the twenty-four (24) hour refund window has expired. Gaming hardware, sealed software, and accessories may be ineligible for return once packaging has been opened, serial numbers registered, or hygiene seals broken, except where a manufacturing defect is demonstrated.',
        'Return shipping costs for approved damage or defect claims will be handled according to the resolution we offer. Customers may be responsible for return shipping in cases where inspection reveals user damage, misuse, or exclusion under this policy. Items must be returned in reasonable condition with all included components unless damage prevented safe use.',
        'Replacements are subject to inventory availability. If a replacement cannot be sourced within a reasonable timeframe, we may offer store credit or a refund outside the standard twenty-four (24) hour window solely for verified damage or fulfillment error claims approved by AURA TECH management.',
      ],
      bullets: [
        'Report shipping damage or defects within forty-eight (48) hours of delivery with photo evidence.',
        'Change-of-mind returns are generally not accepted after the twenty-four (24) hour refund period.',
        'Opened or registered products may be non-returnable except for verified defects.',
        'Approved claims may result in replacement, repair assistance, or compensation at our discretion.',
      ],
    },
    {
      id: 'shipping',
      title: '6. Shipping and Delivery',
      paragraphs: [
        'AURA TECH ships gaming products and related accessories to addresses within Yemen and select destinations across the Middle East, subject to product restrictions, carrier availability, and applicable customs or regulatory requirements. Shipping options, estimated delivery timeframes, and any regional surcharges are displayed or communicated during checkout or order confirmation.',
        'Delivery timelines are estimates only and are not guaranteed. Delays may occur due to carrier capacity, weather, security conditions, customs inspection, remote location access, public holidays, or events outside our reasonable control. We will make commercially reasonable efforts to notify you of significant delays when information is available from our logistics partners.',
        'You are responsible for providing a complete and accurate shipping address, including governorate, district, landmark details where helpful, and a reachable phone number. Failed delivery attempts caused by incorrect addresses, unavailability to receive packages, or refusal to pay applicable local fees may result in return of goods to us and additional reshipment charges.',
        'Risk of loss or damage during transit transfers to you upon delivery to the address specified in your order or upon pickup from an authorized collection point if that method is used. Inspect packages upon receipt and report visible damage immediately in accordance with our Returns and Damaged Items section.',
        'International or cross-border shipments within the Middle East may be subject to import duties, taxes, or inspection fees imposed by local authorities. Unless explicitly included in your order total, these charges are your responsibility. AURA TECH does not control customs processing times and cannot guarantee clearance by a specific date.',
      ],
      bullets: [
        'Primary service area: Yemen and selected Middle East destinations.',
        'Shipping occurs only after payment approval and order confirmation.',
        'Delivery estimates are not guaranteed and may vary by region and carrier.',
        'Accurate shipping addresses and contact numbers are required.',
        'Customs duties or local fees may apply and are typically customer responsibility.',
      ],
    },
    {
      id: 'product-info',
      title: '7. Product Information and Availability',
      paragraphs: [
        'We strive to display accurate product titles, descriptions, specifications, compatibility notes, images, and pricing for gaming consoles, peripherals, accessories, and related merchandise. However, manufacturers may revise specifications, packaging, or bundled contents without notice, and occasional errors may appear on our website.',
        'Product colors, dimensions, and in-box contents shown in images are representative and may vary slightly from the physical item received. Technical compatibility information is provided as guidance only; you are responsible for verifying compatibility with your existing hardware, regional power requirements, and software ecosystem before purchase, especially after the twenty-four (24) hour refund window has passed.',
        'Inventory levels are dynamic. Adding an item to your cart does not reserve stock indefinitely. Inventory is formally allocated upon payment approval. If an item becomes unavailable after your payment is approved but before shipment, we will contact you to offer a substitute, waitlist option, or refund outside the standard refund request process for that specific fulfillment failure.',
        'Promotional pricing, bundle offers, and discount codes are valid only for the stated period and subject to terms disclosed with the promotion. We reserve the right to limit quantities per customer, cancel orders that abuse promotional mechanics, and modify or withdraw offers without prior notice.',
        'Pre-orders or back-order items, if offered, will ship according to dates communicated on the product page or in follow-up emails. Dates for pre-orders are estimates and may change based on supplier timelines.',
      ],
      bullets: [
        'Product images and specifications are subject to manufacturer updates.',
        'Verify compatibility before purchase to avoid post-refund-window issues.',
        'Stock is reserved only after payment approval.',
        'Promotional offers may include quantity limits and expiration dates.',
      ],
    },
    {
      id: 'accounts',
      title: '8. User Accounts',
      paragraphs: [
        'Certain features of AURA TECH, including order tracking, receipt upload, and purchase history, may require account registration. You agree to provide truthful, current, and complete information during registration and to update your profile when your contact or delivery details change.',
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account. Notify us immediately at support@auratechplus.com if you suspect unauthorized access, credential compromise, or fraudulent orders associated with your account.',
        'We may suspend or terminate accounts that violate these Terms, provide false information, engage in abusive conduct toward staff, attempt to circumvent payment or refund policies, or participate in fraudulent receipt uploads or chargeback schemes.',
        'Account deletion requests may be submitted to support@auratechplus.com. Deletion may be delayed where records must be retained for legal, tax, fraud prevention, or order dispute purposes. Deleting an account does not retroactively alter obligations tied to completed or pending orders.',
      ],
      bullets: [
        'Keep registration and shipping information accurate and up to date.',
        'Protect your login credentials and notify us of suspected unauthorized use.',
        'One account per individual unless authorized for business use.',
        'We may suspend accounts that abuse policies or threaten platform integrity.',
      ],
    },
    {
      id: 'prohibited',
      title: '9. Prohibited Uses',
      paragraphs: [
        'You may use AURA TECH only for lawful purposes and in accordance with these Terms. You agree not to use the website, communication channels, or ordering system in any way that violates applicable local, national, or international law or regulation.',
        'Prohibited conduct includes attempting to gain unauthorized access to our systems, scraping or harvesting data without permission, uploading malicious code, impersonating another person, submitting falsified payment receipts, initiating fraudulent refund or chargeback claims, reselling products obtained through policy abuse, or interfering with the proper functioning of the platform.',
        'You may not use our services to purchase products for export or resale in violation of manufacturer restrictions, sanctions, or regional distribution agreements where such restrictions apply. We reserve the right to investigate suspicious order patterns and cooperate with financial institutions or authorities when fraud is suspected.',
        'Violations of this section may result in immediate order cancellation, forfeiture of eligibility for refunds even within the twenty-four (24) hour window where fraud is established, permanent account termination, and pursuit of available legal remedies.',
      ],
      bullets: [
        'No falsified payment receipts or fraudulent transfer claims.',
        'No unauthorized access, data scraping, or platform interference.',
        'No abusive, threatening, or harassing communication with staff.',
        'No circumvention of regional restrictions or promotional abuse schemes.',
      ],
    },
    {
      id: 'liability',
      title: '10. Limitation of Liability',
      paragraphs: [
        'To the fullest extent permitted by applicable law, AURA TECH and its owners, directors, employees, agents, suppliers, and logistics partners shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including lost profits, lost data, business interruption, or reputational harm arising from your use of our services or products, even if we have been advised of the possibility of such damages.',
        'Our total aggregate liability to you for any claim arising out of or relating to these Terms, an order, a product, payment processing, shipping, or customer support shall not exceed the amount you paid to AURA TECH for the specific order giving rise to the claim. This cap applies collectively to all claims and forms of relief except where prohibited by mandatory applicable law.',
        'We do not warrant that the website will be uninterrupted, error-free, or free of harmful components. Gaming product performance depends on many factors outside our control, including firmware updates, network conditions, and user configuration. Product warranties, if any, are provided by manufacturers and must be claimed according to their terms.',
        'You acknowledge that the manual bank transfer payment model and twenty-four (24) hour approval and refund windows require timely action on your part. AURA TECH is not liable for losses resulting from your failure to upload receipts promptly, monitor order status, or submit refund requests within the twenty-four (24) hour refund period.',
      ],
      bullets: [
        'Total liability is capped at the order amount paid for the relevant transaction.',
        'We are not liable for indirect or consequential damages where permitted by law.',
        'Manufacturer warranties apply separately from these Terms.',
        'Timely customer action is required under our payment and refund policies.',
      ],
    },
    {
      id: 'disputes',
      title: '11. Disputes, Governing Law, and Arbitration',
      paragraphs: [
        'These Terms and any dispute or claim arising out of or relating to them, your use of AURA TECH services, or any order placed through our platform shall be governed by and construed in accordance with the laws of the Republic of Yemen, without regard to conflict-of-law principles that would apply another jurisdiction\'s laws.',
        'Before initiating formal dispute proceedings, you agree to contact support@auratechplus.com and attempt to resolve the matter informally within a reasonable period. Many issues involving payment receipt verification, shipment status, or refund eligibility within the twenty-four (24) hour window can be resolved through direct support engagement.',
        'If informal resolution fails, any dispute, controversy, or claim arising out of or relating to these Terms or any order shall be resolved by binding arbitration in Yemen in accordance with applicable arbitration rules mutually agreed upon or, failing agreement, under the rules of a recognized arbitration institution operating in Yemen. The arbitration shall be conducted in Arabic or English as agreed by the parties, before a single arbitrator, and judgment on the award may be entered in any court of competent jurisdiction.',
        'You and AURA TECH agree that arbitration will be on an individual basis. Class actions, class arbitrations, private attorney general actions, and consolidation with other proceedings are waived to the extent permitted by law. The arbitrator may award relief only in favor of the individual party seeking relief and only to the extent necessary to resolve that party\'s individual claim, subject to the liability cap in Section 10.',
        'Notwithstanding the above, either party may seek injunctive or equitable relief in a competent court to protect intellectual property rights or prevent unauthorized access or misuse of the platform.',
      ],
      bullets: [
        'Governing law: Republic of Yemen.',
        'Contact support before escalating to formal dispute processes.',
        'Binding arbitration in Yemen for unresolved disputes where permitted.',
        'Individual dispute resolution; class actions waived where legally allowed.',
      ],
    },
    {
      id: 'intellectual-property',
      title: '12. Intellectual Property',
      paragraphs: [
        'All content on the AURA TECH website—including logos, trademarks, trade dress, text, graphics, product photography, layout, software, and design elements—is owned by AURA TECH or its licensors and is protected by applicable intellectual property laws. Unauthorized reproduction, distribution, modification, or public display is prohibited.',
        'Product names, logos, and imagery belonging to gaming manufacturers or publishers are the property of their respective owners and are used on our site for identification and descriptive purposes. AURA TECH is not affiliated with or endorsed by those third parties unless explicitly stated.',
        'You receive a limited, non-exclusive, non-transferable license to access and use the website for personal, non-commercial shopping purposes in compliance with these Terms. You may not copy, frame, mirror, or exploit any portion of the site without our prior written consent.',
      ],
      bullets: [
        'Website content is protected by copyright and trademark law.',
        'Third-party brand assets belong to their respective owners.',
        'Personal, non-commercial use of the site is permitted under these Terms.',
      ],
    },
    {
      id: 'user-content',
      title: '13. User Content',
      paragraphs: [
        'When you upload payment receipts, submit support messages, post reviews where enabled, or otherwise provide materials to AURA TECH ("User Content"), you represent that you have the right to share that content and that it does not violate any third-party rights or applicable law.',
        'Payment receipts and verification documents may contain personal and financial information. You authorize AURA TECH to use uploaded receipts solely for payment verification, fraud prevention, order fulfillment, accounting, and dispute resolution. Handle your uploads securely and redact sensitive information not required for verification where possible.',
        'If you submit reviews, feedback, or testimonials, you grant AURA TECH a non-exclusive, royalty-free, worldwide license to use, reproduce, and display that content for marketing and service improvement purposes unless you explicitly opt out in writing. We may remove content that is unlawful, misleading, abusive, or inconsistent with our community standards.',
        'We are not responsible for User Content provided by customers and do not endorse opinions expressed in user-submitted reviews. We reserve the right to moderate or remove content at our discretion.',
      ],
      bullets: [
        'Upload only accurate receipts and materials you have the right to share.',
        'Receipts are used for verification, compliance, and dispute handling.',
        'Feedback may be used for marketing unless you opt out in writing.',
        'We may remove abusive or unlawful user content.',
      ],
    },
    {
      id: 'termination',
      title: '14. Termination',
      paragraphs: [
        'We may suspend or terminate your access to AURA TECH services immediately, with or without notice, if you breach these Terms, engage in fraudulent activity, abuse refund or payment policies, harass staff, or create legal or security risk for our business or customers.',
        'You may stop using our services at any time. Termination of access does not eliminate obligations related to orders already placed, payments under review, approved transactions, or disputes arising before termination.',
        'Sections that by their nature should survive termination—including Payment Terms, Refunds, Limitation of Liability, Disputes, Intellectual Property, and Entire Agreement—will continue in effect after termination or account closure.',
      ],
      bullets: [
        'We may suspend access for policy violations or fraud.',
        'You may discontinue use at any time.',
        'Outstanding order obligations survive termination of access.',
      ],
    },
    {
      id: 'contact-support',
      title: '15. Contact and Support',
      paragraphs: [
        'For questions about orders, payment receipt uploads, payment approval status, refund requests within the twenty-four (24) hour window, shipping updates, damaged items, or these Terms, contact AURA TECH customer support at support@auratechplus.com.',
        'Our support team aims to respond to inquiries within twenty-four (24) business hours during regular operating periods. Business hours responses exclude weekends and public holidays unless we publish extended support coverage. Response times may be longer during peak promotional periods, supply disruptions, or regional connectivity issues.',
        'When contacting support, include your order number, registered email address, a clear description of your issue, and any relevant attachments such as receipt copies or delivery photos. This helps us assist you efficiently, especially for time-sensitive matters governed by the twenty-four (24) hour payment approval and twenty-four (24) hour refund policies.',
        'Support communications do not amend these Terms unless confirmed in writing by an authorized AURA TECH representative. Verbal assurances from unofficial channels or social media messages not operated by AURA TECH should not be relied upon for policy exceptions.',
      ],
      bullets: [
        'Email: support@auratechplus.com',
        'Target response time: within twenty-four (24) business hours.',
        'Include order number and registered email in all support requests.',
        'Time-sensitive refund requests must reference the twenty-four (24) hour policy.',
      ],
    },
    {
      id: 'severability',
      title: '16. Severability',
      paragraphs: [
        'If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court or arbitrator of competent jurisdiction, that provision shall be enforced to the maximum extent permissible, and the remaining provisions shall remain in full force and effect.',
        'A failure by AURA TECH to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision. Any waiver must be in writing and signed by an authorized representative to be effective.',
      ],
    },
    {
      id: 'entire-agreement',
      title: '17. Entire Agreement',
      paragraphs: [
        'These Terms, together with our Privacy Policy, checkout disclosures, and any order-specific confirmations that reference them, constitute the entire agreement between you and AURA TECH regarding your use of our services and supersede all prior or contemporaneous understandings, communications, and proposals, whether oral or written.',
        'No employee, contractor, or support agent is authorized to modify these Terms orally or to bind AURA TECH to terms inconsistent with this document. Policy exceptions, including extensions to the twenty-four (24) hour refund window, must be documented in writing by authorized management to be valid.',
        'By completing a purchase, uploading a payment receipt, or continuing to use AURA TECH after the Last Updated date shown above, you confirm that you have read these Terms, understand the manual bank transfer payment process, acknowledge the twenty-four (24) hour payment approval and automatic cancellation rules, and accept the twenty-four (24) hour refund policy as a binding condition of sale.',
      ],
    },
  ],
};
