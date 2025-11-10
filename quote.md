# Quotation Builder SaaS – FULL MVP SPECIFICATION  
**Version:** 1.0 (MVP)  
**Language:** English  
**Status:** LOCKED & READY TO BUILD  
**Backup Date:** November 08, 2025  
**Authors:** You & Grok (AI Coding Partner)

---

## 1. CORE PRODUCT & COMPOSITION SYSTEM

### 1.1 Product (Base Entity)
| Field | Type | Required | Description | Example |
|------|------|----------|-----------|--------|
| `code` | String | Yes | Unique internal ID | `BC-001` |
| `sku` | String | Yes | Product code | `BC-STD` |
| `name` | String | Yes | Display name | `Business Card - Standard` |
| `width` | Float | No | Physical width | `3.5` |
| `height` | Float | No | Physical height | `2.0` |
| `widthUnit` | String | No | Unit of width | `inch` |
| `heightUnit` | String | No | Unit of height | `inch` |
| `status` | Boolean | Yes | Active/Inactive | `true` |

> **No fixed cost at product level** — total cost is **sum of selected options**

---

### 1.2 Option (Child of Product)
| Field | Type | Required | Description | Example |
|------|------|----------|-----------|--------|
| `code` | String | Yes | Unique within product | `100` |
| `sku` | String | Yes | Option code | `PS-SETUP` |
| `name` | String | Yes | Display name | `Process - Print Setup` |
| `type` | Enum | Yes | `Option` / `Selector` / `Factor` | `Option` |
| `level` | Int | Yes | 0 = root, 1+ = child | `0` |
| `order` | Int | Yes | Display order | `1` |
| `groupName` | String | No | UI grouping | `Prep` |
| `selection` | Enum | No | `Exclusive` / `Inclusive` / `null` | `null` |
| `required` | Boolean | Yes | Must be selected | `true` |
| `sameParent` | Boolean | Yes | `true` → multiply by qty, `false` → fixed | `false` |
| `hidden` | Boolean | Yes | `true` → not shown in PDF | `true` |
| `qty` | Int | Yes | Default quantity | `1` |
| `cost` | Float | No | Default cost per unit | `17.500` |
| `pricebreak` | Array | No | Tiered pricing (see below) | — |

---

### 1.3 Selector (Special Option Type)
- **Purpose**: Group multiple choices
- **No cost of its own**
- **Contains child `Option` or `Factor`**
- **Selection Rules**:
  - `Exclusive` → **only 1 child** can be selected
  - `Inclusive` → **multiple children** allowed

---

### 1.4 Factor (Special Option – Quantity Multiplier)
- **Type**: `Factor`
- **Only inside a `Selector`**
- **Fields**:
  - `name`: `Package of 100`
  - `qty`: `100`
  - `cost`: `0` (optional extra fee)
- **Effect**: When selected → **multiplies Cost Quantity**

---

### 1.5 Pricebreak (Tiered Pricing – ONLY for `Option` type)
```json
[
  { "minQty": 1,   "costPerUnit": 0.600 },
  { "minQty": 100, "costPerUnit": 0.550 },
  { "minQty": 500, "costPerUnit": 0.500 }
]

Not applied to Selector or Factor

2. QUANTITY & COST CALCULATION LOGIC
2.1 Quantity Types

























TypeFormulaExampleOrder QuantityInput by user in quotation3Factor QuantityFrom selected Factor100Cost QuantityOrder Qty × Factor Qty3 × 100 = 300

Multiplication applies only to options where:

sameParent: true
level matches the Selector level



2.2 Cost Calculation per Option
textIF option.type == "Factor"
   → No cost (only triggers quantity multiplier)

ELSE IF option.type == "Option"
   → Get Cost_Quantity
   → IF has Pricebreak
        → Find highest tier where minQty ≤ Cost_Quantity
        → costPerUnit = tier.costPerUnit
   → ELSE
        → costPerUnit = option.cost
   → total = costPerUnit × Cost_Quantity

IF sameParent == false
   → total = option.cost × 1 (fixed cost, ignore quantity)

2.3 Full Example: Business Card
Order Qty = 2, Selected Factor = Package of 100


















































OptionTypesameParentCost QtyPricebreakcostPerUnitTotalPrint SetupOptionfalse1No17.50017.500Cover 15ptOptiontrue200Yes0.550110.000(4/4) Full ColorOptiontrue200No2.000400.000Package of 100Factortrue———Multiplier

Product Total: 17.500 + 110.000 + 400.000 = 527.500


3. QUOTATION SYSTEM
3.1 Quotation Fields























































FieldTypeDescriptionnumberStringAuto-generated: Q-2025-001customerNameStringCustomer namecustomerCompanyStringOptionalstatusEnumDRAFT, PENDING, APPROVED, REJECTED, SENTdiscountFloatDiscount valuediscountTypeEnumpercent / fixedtaxRateFloatDefault 10currencyStringUSD (MVP)expiryDateDateDefault: +7 days

3.2 Total Calculation Logic
textSubtotal = Σ (Total of each product)

Discount Amount = 
   IF percent: Subtotal × (discount / 100)
   IF fixed: discount

Taxable Amount = Subtotal - Discount Amount
Tax = Taxable Amount × taxRate / 100
Grand Total = Taxable Amount + Tax

4. PDF OUTPUT
4.1 Layout Template (System-Defined)
html[LOGO]
Company: {COMPANY_NAME}
Address: {COMPANY_ADDRESS} | Phone: {PHONE} | Email: {EMAIL}

QUOTE #: {QUOTE_NUMBER}
Date: {QUOTE_DATE}
Valid until: {EXPIRY_DATE}

Dear {CUSTOMER_NAME},

─────────────────────────────────────────────────────
PRODUCT DETAILS
─────────────────────────────────────────────────────
Business Card - Standard
→ Cover: 15pt - SILK
→ Print: (4/4) - Full Color Front & Back
→ Package: x100 units
200 units × 2,637.5 = 527,500

Tent Card 4x6
→ Cover: 15pt - SILK
→ Perforated Base
→ Package: x25 units
25 units × 3,942 = 98,550
─────────────────────────────────────────────────────

Subtotal:                    626,050
Discount (10% - Nice customer): -62,605
────────────────────────────────────
Amount after discount:       563,445
VAT (10%):                    56,345
────────────────────────────────────
GRAND TOTAL:                 619,790

{NOTE}
Example: "Thank you for your trust. Free 1 sample print."

{POLICY}
Example: "Quote valid for 7 days. 50% deposit required."

Best regards,
[Signature]
{SALES_NAME} - Sales Manager

Hidden options (e.g., Print Setup) are not shown
Selector names (e.g., PAPER SELECTION) are not shown, only selected children
Factor shown as: Package: x100 units


5. USER ROLES & APPROVAL WORKFLOW





















RolePermissionsADMINFull access: create/edit/delete/clone products, layouts, users, settingsMANAGERCreate quotations + Approve/Reject discount requestsSALECreate quotations, select options, apply discount (based on setting)
Sale Account Setting (Set by Admin)

















SettingEffectneedApproval: trueSale adds discount → PENDING → awaits Manager approvalneedApproval: falseSale can apply discount → Export PDF immediately

Approval Flow
#mermaid-diagram-mermaid-u0rkrll{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;fill:#000000;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-diagram-mermaid-u0rkrll .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-diagram-mermaid-u0rkrll .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-diagram-mermaid-u0rkrll .error-icon{fill:#552222;}#mermaid-diagram-mermaid-u0rkrll .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-mermaid-u0rkrll .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-mermaid-u0rkrll .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-mermaid-u0rkrll .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-mermaid-u0rkrll .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-mermaid-u0rkrll .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-mermaid-u0rkrll .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-mermaid-u0rkrll .marker{fill:#666;stroke:#666;}#mermaid-diagram-mermaid-u0rkrll .marker.cross{stroke:#666;}#mermaid-diagram-mermaid-u0rkrll svg{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;}#mermaid-diagram-mermaid-u0rkrll p{margin:0;}#mermaid-diagram-mermaid-u0rkrll .label{font-family:"trebuchet ms",verdana,arial,sans-serif;color:#000000;}#mermaid-diagram-mermaid-u0rkrll .cluster-label text{fill:#333;}#mermaid-diagram-mermaid-u0rkrll .cluster-label span{color:#333;}#mermaid-diagram-mermaid-u0rkrll .cluster-label span p{background-color:transparent;}#mermaid-diagram-mermaid-u0rkrll .label text,#mermaid-diagram-mermaid-u0rkrll span{fill:#000000;color:#000000;}#mermaid-diagram-mermaid-u0rkrll .node rect,#mermaid-diagram-mermaid-u0rkrll .node circle,#mermaid-diagram-mermaid-u0rkrll .node ellipse,#mermaid-diagram-mermaid-u0rkrll .node polygon,#mermaid-diagram-mermaid-u0rkrll .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-mermaid-u0rkrll .rough-node .label text,#mermaid-diagram-mermaid-u0rkrll .node .label text,#mermaid-diagram-mermaid-u0rkrll .image-shape .label,#mermaid-diagram-mermaid-u0rkrll .icon-shape .label{text-anchor:middle;}#mermaid-diagram-mermaid-u0rkrll .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-mermaid-u0rkrll .rough-node .label,#mermaid-diagram-mermaid-u0rkrll .node .label,#mermaid-diagram-mermaid-u0rkrll .image-shape .label,#mermaid-diagram-mermaid-u0rkrll .icon-shape .label{text-align:center;}#mermaid-diagram-mermaid-u0rkrll .node.clickable{cursor:pointer;}#mermaid-diagram-mermaid-u0rkrll .root .anchor path{fill:#666!important;stroke-width:0;stroke:#666;}#mermaid-diagram-mermaid-u0rkrll .arrowheadPath{fill:#333333;}#mermaid-diagram-mermaid-u0rkrll .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-mermaid-u0rkrll .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-mermaid-u0rkrll .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-mermaid-u0rkrll .edgeLabel p{background-color:white;}#mermaid-diagram-mermaid-u0rkrll .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-mermaid-u0rkrll .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-mermaid-u0rkrll .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-mermaid-u0rkrll .cluster text{fill:#333;}#mermaid-diagram-mermaid-u0rkrll .cluster span{color:#333;}#mermaid-diagram-mermaid-u0rkrll div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-mermaid-u0rkrll .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-mermaid-u0rkrll rect.text{fill:none;stroke-width:0;}#mermaid-diagram-mermaid-u0rkrll .icon-shape,#mermaid-diagram-mermaid-u0rkrll .image-shape{background-color:white;text-align:center;}#mermaid-diagram-mermaid-u0rkrll .icon-shape p,#mermaid-diagram-mermaid-u0rkrll .image-shape p{background-color:white;padding:2px;}#mermaid-diagram-mermaid-u0rkrll .icon-shape rect,#mermaid-diagram-mermaid-u0rkrll .image-shape rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-mermaid-u0rkrll :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}Yes + DiscountApproveRejectNoSale creates quotationneedApproval?Status: PENDINGManager notifiedManager actionStatus: APPROVED → PDF unlockedStatus: REJECTED → Sale editsExport PDF immediately

6. PRODUCT CLONE FEATURE
text→ Click [Clone] on any product
→ Creates independent copy:
   - code: BC-001-CLONE-1
   - sku: BC-STD-CLONE
   - name: Business Card - Standard (Copy)
→ Preserves: options, pricebreak, hidden, levels, groups, sameParent
→ User can edit after cloning

7. MVP SCOPE – OUT OF SCOPE (FUTURE)

































FeatureStatusNon-Unit UOM (sq.ft, bleed, waste, roll)FutureSub-products / Product BundlesFutureOption-level discountFutureMulti-currency conversionFutureAutomated email sendingV1Customer portalV2

8. FULL END-TO-END EXAMPLE – QUOTATION #Q001


























ProductOrder QtyFactorCost QtyLine TotalBusiness Card - Standard2Package of 100200527,500Tent Card 4x61Package of 252598,550
textSubtotal:                    626,050
Discount (10% - Nice customer): -62,605
────────────────────────────────────
Amount after discount:       563,445
VAT (10%):                    56,345
────────────────────────────────────
GRAND TOTAL:                 619,790

9. FINAL CONFIRMATION

















































Confirmed LogicStatusProduct + Option + Selector + FactorYESsameParent, level, hiddenYESCost Quantity = Order × FactorYESPricebreak only on OptionYESMulti-product quotationYESDiscount at quotation level onlyYESPDF hides internal optionsYESClone any productYESRole: Admin / Manager / Sale + ApprovalYESUOM = Unit onlyYES