import { InformationalPage } from "@/components/content/InformationalPage";

export default function ContactPage() {
  return (
    <InformationalPage
      title="Contact AgriMarket"
      description="Use the social profiles below to find AgriMarket online. No support phone number or email address is published on this site."
      sections={[
        {
          heading: "Official social profiles",
          paragraphs: [
            "These links use the profile names provided for AgriMarket. They open the corresponding social platform in a new tab.",
          ],
        },
        {
          heading: "Order and account questions",
          paragraphs: [
            "Do not share passwords, verification codes, or payment credentials through social media. Use the account pages on this site to manage account and order information.",
          ],
        },
      ]}
      links={[
        { label: "Facebook: saronzelekecassiopia", href: "https://www.facebook.com/saronzelekecassiopia", external: true },
        { label: "Instagram: saronzelekecassiopia", href: "https://www.instagram.com/saronzelekecassiopia/", external: true },
        { label: "X: sharonkuye", href: "https://x.com/sharonkuye", external: true },
      ]}
    />
  );
}