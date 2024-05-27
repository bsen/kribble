import MailOutlinedIcon from "@mui/icons-material/MailOutlined";

export const About = () => {
  return (
    <div className="h-screen overflow-y-auto no-scrollbar w-full flex flex-col items-center justify-start p-4">
      <div className="w-full lg:w-[50%] border bg-dark border-semidark rounded-lg p-4 mb-8">
        <div className="text-light mb-4 font-semibold text-[1.5rem]">
          Welcome to FriendCity
        </div>
        <div className="text-sm text-semilight font-light">
          Welcome to FriendCity, your dynamic social hub tailored specifically
          for students and teens. FriendCity is your go-to platform for
          connecting, sharing, and fostering friendships that last a lifetime.
        </div>
      </div>

      <div className="w-full lg:w-[50%] border bg-dark border-semidark rounded-lg p-4 mb-8">
        <div className="text-light mb-4 font-semibold text-[1.5rem]">
          Privacy and Security
        </div>
        <div className="text-sm text-semilight font-light">
          Your privacy and security are paramount to us at FriendCity. We've
          implemented robust measures to ensure a safe and secure environment
          for all our users:
          <ul className="list-disc pl-6">
            <li>
              <strong>Anonymous Expressions:</strong> With our "Hidden Identity
              Posts and Comments" feature, you can freely express yourself
              without revealing your identity, fostering open communication
              while protecting your privacy.
            </li>
            {/* <li>
              <strong>Personalized Privacy:</strong> FriendCity offers extensive
              privacy controls, empowering users to customize their profile
              visibility and manage who can interact with them.
            </li> */}
            <li>
              <strong>Vigilant Moderation:</strong> Our dedicated moderation
              team keeps a watchful eye over the platform, swiftly addressing
              any breaches of our community guidelines to maintain a positive
              atmosphere.
            </li>
            <li>
              <strong>Encrypted Safeguards:</strong> Your data, including the
              identities behind anonymous posts, is safeguarded with
              state-of-the-art encryption, ensuring confidentiality and peace of
              mind.
            </li>
            <li>
              <strong>Empowerment Tools:</strong> Users have the ability to
              report inappropriate content or behavior and can block users to
              prevent further interaction, giving them control over their
              experience.
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-[50%] border bg-dark border-semidark rounded-lg p-4 mb-8">
        <div className="text-light mb-4 font-semibold text-[1.5rem]">
          Terms of Use
        </div>
        <div className="text-sm text-semilight font-light">
          Before using FriendCity, please take a moment to familiarize yourself
          with our terms and conditions:
          <ul className="list-disc pl-6">
            <li>
              <strong>Agreement to Terms:</strong> Your use of FriendCity
              signifies your agreement to abide by our terms and conditions. If
              you disagree, kindly refrain from using our platform.
            </li>
            <li>
              <strong>User Requirements:</strong> FriendCity is designed for
              users aged 13 and above, and adherence to local laws is mandatory
              for use.
            </li>
            <li>
              <strong>Positive Conduct:</strong> Users are expected to adhere to
              our community guidelines, promoting positivity and respect while
              refraining from any harmful behavior.
            </li>
            <li>
              <strong>Content Ownership:</strong> While users maintain ownership
              of their content, by using FriendCity, they grant us permission to
              utilize their content within the platform.
            </li>
            <li>
              <strong>Privacy Assurance:</strong> Our privacy policy governs the
              collection, usage, and disclosure of personal information within
              FriendCity.
            </li>
            <li>
              <strong>Moderation and Compliance:</strong> FriendCity reserves
              the right to moderate content and enforce guidelines to uphold a
              secure and welcoming environment.
            </li>
            <li>
              <strong>Consequences for Misconduct:</strong> Posting
              inappropriate or harmful content may result in serious
              consequences, including the deletion of accounts and further
              actions as necessary to protect our community.
            </li>
            <li>
              <strong>Terms Updates:</strong> Users are responsible for staying
              updated on any changes to our terms. Continued use of FriendCity
              implies acceptance of any revised terms.
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-[50%] border bg-dark border-semidark rounded-lg p-4 mb-8">
        <div className="text-light mb-4 font-semibold text-[1.5rem]">
          Community Guidelines
        </div>
        <div className="text-sm text-semilight font-light">
          We are committed to fostering a positive and safe community
          environment at FriendCity. Please adhere to the following guidelines
          to ensure a pleasant experience for all users:
          <ul className="list-disc pl-6">
            <li>
              <strong>Respectful Behavior:</strong> Treat all users with respect
              and kindness. Harassment, bullying, and hate speech will not be
              tolerated.
            </li>
            <li>
              <strong>Original Content:</strong> Share only original and
              verified content on the platform. Plagiarism and copyright
              infringement are strictly prohibited.
            </li>
            <li>
              <strong>Legal Compliance:</strong> Do not engage in illegal
              activities or promote harmful behavior, including but not limited
              to, violence, terrorism, and substance abuse.
            </li>
            <li>
              <strong>Reporting Inappropriate Content:</strong> If you encounter
              any content that violates our guidelines, please report it
              immediately. Our moderation team will take appropriate action.
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-[50%] border bg-dark border-semidark rounded-lg p-4">
        <div className="text-light flex items-center gap-2 font-semibold mb-4 text-[1.5rem]">
          Contact Us <MailOutlinedIcon />
        </div>
        <div className="text-sm text-semilight font-light">
          Have questions or need assistance? Reach out to us at{" "}
          <a
            href="mailto:support@friendcity.in"
            className="text-blue-500 hover:underline"
          >
            support@friendcity.in
          </a>
          . We're here to help!
        </div>
      </div>
    </div>
  );
};
