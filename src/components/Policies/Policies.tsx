import MailOutlinedIcon from "@mui/icons-material/MailOutlined";

export const Policies = () => {
  return (
    <>
      <div className="pb-24 pt-4 h-screen overflow-y-auto no-scrollbar w-full flex flex-col items-center justify-start p-2">
        <div className="w-full lg:w-[50%] p-2 mb-8">
          <div className="text-light mb-4 text-2xl font-semibold">
            Welcome to Kribble
          </div>
          <div className="text-sm text-semilight">
            Welcome to Kribble, the badass platform for dynamic photo and video
            streaming and sharing.
          </div>
        </div>

        <div className="w-full lg:w-[50%] p-2 mb-8">
          <div className="text-light mb-4 text-2xl font-semibold">
            Privacy and Security
          </div>
          <div className="text-sm text-semilight">
            At Kribble, your privacy and security are paramount. We employ
            stringent measures to ensure a secure and enjoyable experience for
            all users:
            <ul className="list-disc pl-6">
              <li>
                <strong>Vigilant Moderation:</strong> Our dedicated moderation
                team diligently monitors the platform, swiftly addressing any
                violations of our community guidelines to uphold a positive
                atmosphere.
              </li>
              <li>
                <strong>Encrypted Safeguards:</strong> Rest assured, your data,
                including anonymous posts, is protected by state-of-the-art
                encryption, ensuring confidentiality and peace of mind.
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-[50%] p-2 mb-8">
          <div className="text-light mb-4 text-2xl font-semibold">
            Terms of Use
          </div>
          <div className="text-sm text-semilight">
            Before diving into Kribble, please review our terms and conditions:
            <ul className="list-disc pl-6">
              <li>
                <strong>Agreement to Terms:</strong> By using Kribble, you agree
                to adhere to our terms and conditions. If you do not agree,
                please refrain from using our platform.
              </li>
              <li>
                <strong>User Requirements:</strong> Kribble is designed for
                users aged 12 and above. Users must comply with local laws and
                regulations.
              </li>
              <li>
                <strong>Positive Conduct:</strong> Uphold our community
                guidelines, promoting positivity and respect while refraining
                from any harmful behavior.
              </li>
              <li>
                <strong>Content Ownership:</strong> While users maintain
                ownership of their content, by using Kribble, they grant us
                permission to utilize their content within the platform.
              </li>
              <li>
                <strong>Privacy Assurance:</strong> Our privacy policy governs
                the collection, usage, and disclosure of personal information
                within Kribble.
              </li>
              <li>
                <strong>Moderation and Compliance:</strong> Kribble reserves the
                right to moderate content and enforce guidelines to uphold a
                secure and welcoming environment.
              </li>
              <li>
                <strong>Consequences for Misconduct:</strong> Posting
                inappropriate or harmful content may result in serious
                consequences, including the deletion of accounts and further
                actions as necessary to protect our community.
              </li>
              <li>
                <strong>Terms Updates:</strong> Users are responsible for
                staying updated on any changes to our terms. Continued use of
                Kribble implies acceptance of any revised terms.
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-[50%] p-2">
          <div className="text-light flex items-center gap-2 text-2xl font-semibold mb-4">
            Contact Us <MailOutlinedIcon />
          </div>
          <div className="text-sm text-semilight">
            Need assistance? Have a suggestion or feature request for us? Want
            to share your feedback or ideas for improvement? Reach out to us
            at&nbsp;
            <a
              href="mailto:info@algabay.com"
              className="text-blue-500 hover:underline"
            >
              info@algabay.com
            </a>
            . We're all ears!
          </div>
        </div>
      </div>
    </>
  );
};
