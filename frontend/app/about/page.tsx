import { InformationalPage } from "@/components/content/InformationalPage";

export default function AboutPage() {
  return (
    <InformationalPage
      title="About AgriMarket"
      description="AgriMarket is an agricultural marketplace project focused on connecting producers and buyers in Ethiopia."
      sections={[
        {
          heading: "Our purpose",
          paragraphs: [
            "The marketplace is designed to make agricultural product listings easier to discover and compare, while giving producers a digital way to reach buyers.",
            "The project focuses on Ethiopia and agricultural products. Product availability and seller information depend on the listings currently published on the marketplace.",
          ],
        },
        {
          heading: "What you can do here",
          paragraphs: [
            "Visitors can browse marketplace listings, search for products, review listing details, and create a buyer or seller account. Signed-in buyers can use the cart and checkout areas of the site.",
            "Features that are not available in the current release are not represented as active services on this page.",
          ],
        },
      ]}
      links={[
        { label: "Browse the marketplace", href: "/marketplace" },
        { label: "How it works", href: "/how-it-works" },
        { label: "Contact and social pages", href: "/contact" },
      ]}
    />
  );
}