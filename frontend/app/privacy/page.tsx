import { InformationalPage } from "@/components/content/InformationalPage";

export default function PrivacyPage() {
  return (
    <InformationalPage
      title="Privacy Notice"
      description="This notice describes data represented in the current AgriMarket application. AgriMarket is an independently developed, unregistered project; its operator and legal contact details have not been published."
      sections={[
        {
          heading: "Information the application handles",
          paragraphs: [
            "Account information can include a user's name, email address, phone number, and account role. Seller profiles can include a business name, description, phone number, and location. Product listings can include descriptions, prices, units, production locations, and uploaded images.",
            "The application can also store saved addresses (recipient name and phone, region, zone, woreda, kebele, location details, and address type), cart and wishlist contents, reviews, notifications, and order records when those features are used.",
            "Security and audit records may include request IP addresses and user-agent information. Passwords are stored as hashes; authentication tokens are issued in HTTP-only cookies, with a separate CSRF cookie used for state-changing requests.",
          ],
        },
        {
          heading: "How information is used",
          paragraphs: [
            "The application uses this information to provide accounts, authenticate users, display listings, manage saved addresses and shopping features, support order workflows when enabled, and protect the service.",
            "When real SMTP is configured, email addresses are used for verification, password-reset, and account-related messages. Without configured email delivery, those email-dependent actions are unavailable; the application does not simulate successful delivery.",
          ],
        },
        {
          heading: "Payments and external services",
          paragraphs: [
            "No payment provider is currently enabled. The checkout is unavailable, and this release does not ask users to enter payment credentials. A future payment integration will require an updated notice before it is enabled.",
            "The backend can send email through an SMTP service configured by the operator. The deployed database, email provider, and file-storage vendors depend on deployment configuration; their identities have not been supplied for publication.",
          ],
        },
        {
          heading: "Retention and account controls",
          paragraphs: [
            "No fixed data-retention schedule has been established or published. The application currently has no self-service account-deletion feature. Records may remain in the configured database until an operator removes them under a retention process that still needs to be defined.",
            "Before the project accepts public accounts or transactions, the operator must establish retention periods, account-deletion and privacy-request handling, and a dedicated privacy contact.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "No privacy email address or postal address has been provided. The Contact page lists the project's supplied social profiles, but they are not a designated privacy-request service and should not be used to send passwords, verification codes, or payment details.",
          ],
        },
      ]}
      links={[
        { label: "Terms of use", href: "/terms" },
        { label: "Contact and social profiles", href: "/contact" },
      ]}
    />
  );
}