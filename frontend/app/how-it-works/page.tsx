import { InformationalPage } from "@/components/content/InformationalPage";

export default function HowItWorksPage() {
  return (
    <InformationalPage
      title="How AgriMarket works"
      description="A practical guide to the buyer-facing features available in the current marketplace."
      sections={[
        {
          heading: "Find products",
          paragraphs: [
            "Browse listings in the marketplace or use search and category filters to narrow the products shown.",
          ],
        },
        {
          heading: "Review a listing",
          paragraphs: [
            "Open a product to review its available listing information, including price, unit, images, and production location when provided by the seller.",
          ],
        },
        {
          heading: "Use your buyer account",
          paragraphs: [
            "Create an account or sign in to use account-based shopping features such as the cart and checkout. Order information is available from the account area when orders exist.",
          ],
        },
        {
          heading: "Availability and fulfillment",
          paragraphs: [
            "Product availability, delivery details, and payment options depend on the listing and the services configured for the current release. Review the information shown during checkout before placing an order.",
          ],
        },
      ]}
      links={[
        { label: "Browse products", href: "/marketplace" },
        { label: "Create an account", href: "/auth/register" },
        { label: "Contact AgriMarket", href: "/contact" },
      ]}
    />
  );
}