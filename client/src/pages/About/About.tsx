import MailOutlinedIcon from "@mui/icons-material/MailOutlined";

export const About = () => {
  return (
    <div className="h-screen overflow-y-auto no-scrollbar w-full flex flex-col items-center justify-start p-4">
      <div className="w-[100%] lg:w-[50%] border bg-bgmain border-bordermain rounded-lg p-4">
        <div className="text-textmain mb-4 font-ubuntu font-semibold text-[1.5rem]">
          Welcome to FriendSphere
        </div>
        <div className="text-sm text-texttwo font-light">
          Welcome to FriendSphere, your dynamic social hub tailored specifically
          for students and teens. FriendSphere is your go-to platform for
          connecting, sharing, and fostering friendships that last a lifetime.
        </div>
      </div>

      <div className="mt-8 w-[100%] lg:w-[50%] bg-bgmain  border bg-whitemain border-bordermain rounded-lg p-4">
        <div className="text-textmain mb-4 font-semibold text-[1.5rem]">
          Privacy and Security
        </div>
        <div className="text-sm text-texttwo font-light">
          Your privacy and security are our top priorities here at FriendSphere.
          We've implemented robust measures to ensure a safe and secure
          environment for all our users:
          <ul className="list-disc pl-6">
            <li>
              Anonymous Expressions: With our "Incognito Shares" feature, you
              can freely express yourself without revealing your identity,
              fostering open communication while protecting your privacy.
            </li>
            <li>
              Personalized Privacy: FriendSphere offers extensive privacy
              controls, empowering users to customize their profile visibility
              and manage who can interact with them.
            </li>
            <li>
              Vigilant Moderation: Our dedicated moderation team keeps a
              watchful eye over the platform, swiftly addressing any breaches of
              our community guidelines to maintain a positive atmosphere.
            </li>
            <li>
              Encrypted Safeguards: Your data, including the identities behind
              anonymous posts, is safeguarded with state-of-the-art encryption,
              ensuring confidentiality and peace of mind.
            </li>
            <li>
              Empowerment Tools: Users have the ability to report inappropriate
              content or behavior and can block users to prevent further
              interaction, giving them control over their experience.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 w-[100%] lg:w-[50%] bg-bgmain border bg-whitemain border-bordermain rounded-lg p-4">
        <div className="text-textmain font-semibold mb-4 text-[1.5rem]">
          Terms of Use
        </div>
        <div className="text-sm text-texttwo  font-light">
          Before diving into FriendSphere, please take a moment to familiarize
          yourself with our terms and conditions:
          <ul className="list-disc pl-6">
            <li>
              Agreement to Terms: Your use of FriendSphere signifies your
              agreement to abide by our terms and conditions. If you disagree,
              kindly refrain from using our platform.
            </li>
            <li>
              User Requirements: FriendSphere is designed for users aged 13 and
              above, and adherence to local laws is mandatory for use.
            </li>
            <li>
              Positive Conduct: Users are expected to adhere to our community
              guidelines, promoting positivity and respect while refraining from
              any harmful behavior.
            </li>
            <li>
              Content Ownership: While users maintain ownership of their
              content, by using FriendSphere, they grant us permission to
              utilize their content within the platform.
            </li>
            <li>
              Privacy Assurance: Our privacy policy governs the collection,
              usage, and disclosure of personal information within FriendSphere.
            </li>
            <li>
              Moderation and Compliance: FriendSphere reserves the right to
              moderate content and enforce guidelines to uphold a secure and
              welcoming environment.
            </li>
            <li>
              Consequences for Misconduct: Posting inappropriate or harmful
              content may result in serious consequences, including the deletion
              of accounts and further actions as necessary to protect our
              community.
            </li>
            <li>
              Terms Updates: Users are responsible for staying updated on any
              changes to our terms. Continued use of FriendSphere implies
              acceptance of any revised terms.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 w-[100%] lg:w-[50%] bg-bgmain border bg-whitemain border-bordermain rounded-lg p-4">
        <div className="text-textmain font-semibold mb-4 text-[1.5rem]">
          About Our Founder
        </div>
        <div className="text-sm text-texttwo font-light">
          Meet the driving force behind FriendSphere, our founder—an avid tech
          enthusiast whose journey into programming sparked a fervent passion
          for innovation. Fueled by a vision to forge a digital haven where
          college mates could convene and thrive, our founder embarked on a
          mission to revolutionize the social landscape.
        </div>
      </div>
      <div className="mt-8 w-[100%] lg:w-[50%] bg-bgmain border bg-whitemain border-bordermain rounded-lg p-4">
        <div className="text-textmain flex items-center gap-2 font-semibold mb-4 text-[1.5rem]">
          Contact Us <MailOutlinedIcon />
        </div>
        <div className="text-sm text-texttwo font-light">
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
