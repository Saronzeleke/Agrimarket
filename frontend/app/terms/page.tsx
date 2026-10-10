import { InformationalPage } from "@/components/content/InformationalPage";

export default function TermsPage() {
  return (
    <InformationalPage
      title="Terms of Use"
      description="A factual notice about the current AgriMarket project and its available features. AgriMarket is an independently developed, unregistered project."
      sections={[
        {
          heading: "Current service status",
          paragraphs: [
            "The current site supports browsing agricultural listings, creating accounts, and managing account features. Checkout is disabled because no real payment provider is configured. Do not submit an order or payment through this release.",
            "A payment provider may be integrated in the future. No future payment method, fee, delivery promise, or transaction is offered by this notice.",
          ],
        },
        {
          heading: "Accounts and listings",
          paragraphs: [
            "Account and listing information is entered by users. Product availability, descriptions, prices, images, and production locations may be supplied by sellers and should be reviewed on the listing.",
            "The project has not published separate seller fees, seller fulfillment terms, or commercial order terms. Those terms must be established before paid transactions are enabled.",
          ],
        },
        {
          heading: "Orders, delivery, and refunds",
          paragraphs: [
            "Orders cannot currently be placed through checkout. Because there are no enabled payments, this release does not establish a cancellation, delivery, or refund policy for completed transactions.",
            "Do not treat product listings as confirmation of an order, delivery arrangement, or payment obligation.",
          ],
        },
        {
          heading: "Project status and updates",
          paragraphs: [
            "AgriMarket is not currently registered as a business. These terms describe the present software preview and are not a substitute for reviewed terms for a registered commercial service.",
            "Before enabling public commercial transactions, the project needs approved operator details and complete seller, payment, delivery, cancellation, and refund terms.",
          ],
        },
      ]}
      links={[
        { label: "Privacy notice", href: "/privacy" },
        { label: "Contact and social profiles", href: "/contact" },
        { label: "Browse the marketplace", href: "/marketplace" },
      ]}
    />
  );
}