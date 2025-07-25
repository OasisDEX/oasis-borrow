import Link from 'next/link'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

export default () => (
  <Box
    sx={{
      '& > p': {
        my: 3,
      },
    }}
  >
    <Heading as="h1">Privacy Policy</Heading>
    <Text as="p" sx={{ textDecoration: 'italic' }}>
      Last updated: 17 July 2025
    </Text>
    <Text as="p">
      This Privacy Policy provides our privacy policy regarding the nature, purpose, use, and
      sharing of personal data or other information collected from the users of the summer.fi
      website and other websites which use subdomains of summer.fi (the &quot;Site&quot;). We are
      committed to protecting and respecting your privacy. Please read this carefully as this
      Privacy Policy is legally binding when you use the Site.
    </Text>
    <Text as="p">
      As used in this Privacy Policy, &quot;we&quot;, &quot;us&quot; or &quot;our&quot; refers to
      Oazo Apps Limited, a company incorporated and registered in England, United Kingdom. We are
      the controller and responsible for your personal data. You can reach us with any requests
      relating to this Privacy Policy via the contact details set out in the Contact us section of
      this Privacy Policy.
    </Text>

    <Heading as="h2">The types of personal data we collect about you</Heading>
    <Text as="p">
      Personal data means any information about an individual from which that person can be
      identified.
    </Text>
    <Text as="p">
      We may collect, use, store and transfer different kinds of personal data about you which we
      have grouped together as follows:
    </Text>
    <ul>
      <li>
        <Text as="strong">Identity Data</Text> includes first name, last name, any previous names,
        username or similar identifier, date of birth and gender.
      </li>
      <li>
        <Text as="strong">Contact Data</Text> includes email address and delivery address.
      </li>
      <li>
        <Text as="strong">Financial Data</Text> includes information on your cryptocurrency wallet
        account balance and virtual currencies.
      </li>
      <li>
        <Text as="strong">Transaction Data</Text> includes details about your blockchain transaction
        history and information relating to your use of the services on our website.
      </li>
      <li>
        <Text as="strong">Technical Data</Text> includes internet protocol (IP) address, your login
        data, browser type and version, Ethereum blockchain data, wallet address, time zone setting
        and location, browser plug-in types and versions, operating system and platform, device ID
        and other technology on the devices you use to access this website.
      </li>
      <li>
        <Text as="strong">Profile Data</Text> includes your preferences, feedback and survey
        responses.
      </li>
      <li>
        <Text as="strong">Usage Data</Text> includes information about how you interact with and use
        our website, products and services.
      </li>
      <li>
        <Text as="strong">Marketing and Communications Data</Text> includes your preferences in
        receiving marketing from us and our third parties and your communication preferences.
      </li>
    </ul>
    <Text as="p">
      We also collect, use and share <Text as="strong">aggregated data</Text> such as statistical
      data which is not personal data as it does not directly (or indirectly) reveal your identity.
      For example, we may aggregate individuals Usage Data to calculate the percentage of users
      accessing a specific website feature in order to analyse general trends in how users are
      interacting with our website to help improve the website and our service offering.
    </Text>

    <Heading as="h2">How is your personal data collected?</Heading>
    <Text as="p">
      We use different methods to collect data from and about you including through:
    </Text>
    <ul>
      <li>
        <Text as="strong">Your interactions with us.</Text> You may give us your personal data by
        filling in online forms or by corresponding with us by email or otherwise. This includes
        personal data you provide when you:
        <ul>
          <li>apply for our products or services;</li>
          <li>subscribe to our service or publications;</li>
          <li>request marketing to be sent to you;</li>
          <li>enter a referral programme; or</li>
          <li>give us feedback or contact us.</li>
        </ul>
      </li>
      <li>
        <Text as="strong">Automated technologies or interactions.</Text> As you interact with our
        website, we will automatically collect Technical Data about your equipment, Browser actions
        and patterns. We collect this personal data by using cookies, server logs and other similar
        technologies. Please see our cookie policy{' '}
        <Link href="https://summer.fi/cookie">https://summer.fi/cookie</Link> for further details.
      </li>
      <li>
        <Text as="strong">Third parties or publicly available sources.</Text> We will receive
        personal data about you from various third party sources including third parties we provide
        services to, analytics providers and the Ethereum blockchain where we may collect public
        Ethereum addresses and email addresses to identify and document a user’s journey through our
        products.
      </li>
    </ul>

    <Heading as="h2">How we use your personal data</Heading>
    <Heading as="h3">Legal basis</Heading>
    <Text as="p">
      The law requires us to have a legal basis for collecting and using your personal data. We rely
      on one or more of the following legal bases:
    </Text>
    <ul>
      <li>
        <Text as="strong">Performance of a contract with you:</Text> Where we need to perform the
        contract we are about to enter into or have entered into with you.
      </li>
      <li>
        <Text as="strong">Legitimate interests:</Text> We may use your personal data where it is
        necessary to conduct our business and pursue our legitimate interests, for example to
        prevent fraud and enable us to give you the best and most secure customer experience. We
        make sure we consider and balance any potential impact on you and your rights (both positive
        and negative) before we process your personal data for our legitimate interests. We do not
        use your personal data for activities where our interests are overridden by the impact on
        you (unless we have your consent or are otherwise required or permitted to by law).
      </li>
      <li>
        <Text as="strong">Legal obligation:</Text> We may use your personal data where it is
        necessary for compliance with a legal obligation that we are subject to. We will identify
        the relevant legal obligation when we rely on this legal basis.
      </li>
      <li>
        <Text as="strong">Consent:</Text> We rely on consent only where we have obtained your active
        agreement to use your personal data for a specified purpose, for example if you subscribe to
        an email newsletter.
      </li>
    </ul>

    <Heading as="h3">Purposes for which we will use your personal data</Heading>
    <Text as="p">
      We have set out below, a description of all the ways we plan to use the various categories of
      your personal data, and which of the legal bases we rely on to do so. We have also identified
      what our legitimate interests are where appropriate.
    </Text>
    {/* This is a simple table example. For a more robust table, a dedicated component might be preferred. */}
    <table>
      <thead>
        <tr>
          <th>Purpose/Use</th>
          <th>Type of data</th>
          <th>Legal basis</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            To register you as a new user including by accessing our website via your cryptocurrency
            wallet
          </td>
          <td>
            (a) Identity
            <br />
            (b) Contact
          </td>
          <td>Performance of a contract with you</td>
        </tr>
        <tr>
          <td>
            To manage our relationship with you which will include:
            <br />
            (a) Notifying you about changes to our terms or privacy policy
            <br />
            (b) Dealing with your requests, complaints and queries
          </td>
          <td>
            (a) Identity
            <br />
            (b) Contact
            <br />
            (c) Profile
            <br />
            (d) Marketing and Communications
          </td>
          <td>
            (a) Performance of a contract with you
            <br />
            (b) Necessary to comply with a legal obligation
            <br />
            (c) Necessary for our legitimate interests (to keep our records updated and manage our
            relationship with you)
          </td>
        </tr>
        <tr>
          <td>
            To enable you to partake in any referral programmes available through the Site,
            including Beach Club
          </td>
          <td>
            (a) Identity
            <br />
            (b) Contact
            <br />
            (c) Profile
            <br />
            (d) Usage
            <br />
            (e) Marketing and Communications
          </td>
          <td>
            (a) Performance of a contract with you
            <br />
            (b) Necessary for our legitimate interests (to study how customers use our
            products/services, to develop them and grow our business)
          </td>
        </tr>
        <tr>
          <td>
            To manage your participation in any referral programmes available through the Site,
            including Beach Club, including verifying your referrals and sending you rewards
          </td>
          <td>
            (a) Identity
            <br />
            (b) Contact
            <br />
            (c) Profile
            <br />
            (d) Usage
            <br />
            (e) Marketing and Communications
          </td>
          <td>
            (a) Performance of a contract with you
            <br />
            (b) Necessary for our legitimate interests (to study how customers use our
            products/services, to develop them and grow our business)
          </td>
        </tr>
        <tr>
          <td>
            To administer and protect our business and this website (including troubleshooting, data
            analysis, testing, system maintenance, support, reporting and hosting of data)
          </td>
          <td>
            (a) Identity
            <br />
            (b) Contact
            <br />
            (c) Technical
          </td>
          <td>
            (a) Necessary for our legitimate interests (for running our business, provision of
            administration and IT services, network security, to prevent fraud and in the context of
            a business reorganisation or group restructuring exercise)
            <br />
            (b) Necessary to comply with a legal obligation
          </td>
        </tr>
        <tr>
          <td>
            To use data analytics to improve our website, products/services, customer relationships
            and experiences and to measure the effectiveness of our communications and marketing
          </td>
          <td>
            (a) Technical
            <br />
            (b) Usage
          </td>
          <td>
            Necessary for our legitimate interests (to define types of customers for our products
            and services, to keep our website updated and relevant, to develop our business and to
            inform our marketing strategy)
          </td>
        </tr>
        <tr>
          <td>
            To send you relevant marketing communications and make personalised suggestions and
            recommendations to you about services that may be of interest to you based on your
            Profile Data
          </td>
          <td>
            (a) Identity
            <br />
            (b) Contact
            <br />
            (c) Technical
            <br />
            (d) Usage
            <br />
            (e) Profile
            <br />
            (f) Marketing and Communications
          </td>
          <td>
            Necessary for our legitimate interests (to carry out direct marketing, develop our
            products/services and grow our business)
          </td>
        </tr>
        <tr>
          <td>To carry out market research including through your participation in surveys</td>
          <td>
            (a) Identity
            <br />
            (b) Contact
            <br />
            (c) Profile
          </td>
          <td>
            Necessary for our legitimate interests (to study how customers use our products/services
            and to help us improve and develop our products and services).
          </td>
        </tr>
      </tbody>
    </table>

    <Heading as="h3" mt={4}>
      Blockchain Data
    </Heading>
    <Text as="p">
      Note that we are not responsible for your use of the Ethereum blockchain and your data
      processed in this decentralized and permissionless network.
    </Text>

    <Heading as="h3">Direct marketing</Heading>
    <Text as="p">
      You will receive marketing communications from us if you have requested information from us or
      purchased goods or services from us and you have not opted out of receiving the marketing.
    </Text>
    <Text as="p">
      We may also analyse your Identity, Contact, Technical, Usage and Profile Data to form a view
      which products, services and offers may be of interest to you so that we can then send you
      relevant marketing communications.
    </Text>

    <Heading as="h3">Third-party marketing</Heading>
    <Text as="p">
      We will get your express consent before we share your personal data with any third party for
      their own direct marketing purposes.
    </Text>

    <Heading as="h3">Opting out of marketing</Heading>
    <Text as="p">
      You can ask to stop sending you marketing communications at any time by following the opt-out
      links within any marketing communication sent to you or by contacting us using the details set
      out in the Contact us section of this Privacy Policy.
    </Text>
    <Text as="p">
      If you opt out of receiving marketing communications, you will still receive service-related
      communications that are essential for administrative or customer service purposes for example
      relating to updates to our Terms and Conditions, checking that your contact details are
      correct.
    </Text>

    <Heading as="h3">Cookies</Heading>
    <Text as="p">
      For more information about the cookies we use and how to change your cookie preferences,
      please see <Link href="https://summer.fi/cookie">https://summer.fi/cookie</Link>.
    </Text>

    <Heading as="h2">Disclosures of your personal data</Heading>
    <Text as="p">
      We may share your personal data where necessary with the parties set out below.
    </Text>
    <ul>
      <li>
        <Text as="strong">Service providers acting as processors</Text> who provide services
        including IT and system administration services, online form management, hosting services,
        payment processing, fraud and identity verification providers, service support, email
        delivery and administration, and data storage and analysis.
      </li>
      <li>
        Our <Text as="strong">professional advisors</Text> including lawyers, auditors, insurers,
        consultants and who provide legal, accounting and insurance services.
      </li>
      <li>
        <Text as="strong">Third parties to whom we may choose to sell, transfer or merge</Text>{' '}
        parts of our business or our assets. Alternatively, we may seek to acquire other businesses
        or merge with them. If a change happens to our business, then the new owners may use your
        personal data in the same way as set out in this privacy policy.
      </li>
    </ul>
    <Text as="p">
      We require all third parties to respect the security of your personal data and to treat it in
      accordance with the law. We do not allow our third-party service providers to use your
      personal data for their own purposes and only permit them to process your personal data for
      specified purposes and in accordance with our instructions.
    </Text>

    <Heading as="h2">International transfers</Heading>
    <Text as="p">
      Please note that we may transfer your personal data outside the EU/EEA/UK to third parties for
      the purposes of the data processing and external access by you of services provided by those
      third parties including to jurisdictions not offering the same level of data protection as the
      UK. In such circumstances, we ensure that such transfers are subject to appropriate safeguards
      which give the transferred personal data the same protection as it has in the UK.
    </Text>
    <Text as="p">
      To obtain a copy of these contractual safeguards, please contact us using the details set out
      in the Contact us section of this Privacy Policy.
    </Text>

    <Heading as="h2">Data security</Heading>
    <Text as="p">
      We use appropriate technical and organizational security measures to protect your personal
      data. Our security measures are continuously improved in line with technological developments.
    </Text>
    <Text as="p">
      Please note that any data transmission on the Internet (e.g. communication by email) is
      generally not secure and, subject to any liability which cannot be excluded under applicable
      law, we accept no liability for data transmitted to us via the Internet.
    </Text>

    <Heading as="h2">Third-party links</Heading>
    <Text as="p">
      This website may include links to third-party websites, plug-ins and applications. Clicking on
      those links or enabling those connections may allow third parties to collect or share data
      about you. We do not control these third-party websites and are not responsible for their
      privacy statements. When you leave our website, we encourage you to read the privacy policy of
      every website you visit.
    </Text>

    <Heading as="h2">Data retention</Heading>
    <Text as="p">
      We will retain your personal data only for as long as reasonably necessary to achieve the
      purpose of the processing we collected it for, including for the purposes of satisfying any
      legal, regulatory, tax, accounting or reporting requirements.
    </Text>
    <Text as="p">
      We may retain your personal data for a longer period in the event of a complaint or if we
      reasonably believe there is a prospect of litigation in respect to our relationship with you.
    </Text>
    <Text as="p">
      To determine the appropriate retention period for personal data, we consider the amount,
      nature and sensitivity of the personal data, the potential risk of harm from unauthorised use
      or disclosure of your personal data, the purposes for which we process your personal data and
      whether we can achieve those purposes through other means, and the applicable legal,
      regulatory, tax, accounting or other requirements.
    </Text>

    <Heading as="h2">Your rights</Heading>
    <Heading as="h3">Right to access</Heading>
    <Text as="p">
      As a data subject, you have the right to obtain from us information about your personal data
      processed at any time and a copy of this information. Furthermore, you will have access to the
      following information: the purposes of the processing; the categories of personal data
      concerned; where possible, the envisaged period for which the personal data will be processed,
      or, if not possible, the criteria used to determine that period; the existence of the right to
      request from us rectification or erasure of personal data, or restriction of processing of
      personal data concerning you, or to object to such processing; the existence of the right to
      lodge a complaint with a supervisory authority; where the personal data are not collected
      directly from you, any available information as to their source; and the existence of
      automated decision-making, including profiling, and, at least in those cases, meaningful
      information about the logic involved, as well as the significance and envisaged consequences
      of such processing for you.
    </Text>

    <Heading as="h3">Right to rectification</Heading>
    <Text as="p">
      You have the right to obtain from us, without undue delay, the rectification of inaccurate
      personal data concerning you however we may need to verify the accuracy of the new data you
      provide to us. Taking into account the purposes of the processing, you shall have the right to
      have incomplete personal data completed, including by means of providing a supplementary
      statement.
    </Text>

    <Heading as="h3">Right to be forgotten</Heading>
    <Text as="p">
      You have the right to obtain from us the erasure of personal data concerning you as soon as
      possible, and we shall have the obligation to erase personal data without undue delay where
      required by the law, including when:
    </Text>
    <ul>
      <li>
        the personal data is no longer necessary in relation to the purposes for which they were
        collected or otherwise processed;
      </li>
      <li>there is no longer a legal ground for the processing;</li>
      <li>
        you object to the processing and there are no overriding legitimate grounds for the
        processing;
      </li>
      <li>the personal data has been unlawfully processed;</li>
      <li>
        the personal data must be erased for compliance with a legal obligation in accordance with
        the applicable law to which we are subject.
      </li>
    </ul>
    <Text as="p">
      Note, however, that we may not always be able to comply with your request of erasure for
      specific legal reasons which will be notified to you, if applicable, at the time of your
      request.
    </Text>

    <Heading as="h3">Right to restriction of processing</Heading>
    <Text as="p">
      You have the right to obtain from us the restriction of processing where one of the following
      applies:
    </Text>
    <ul>
      <li>
        the accuracy of the personal data is contested by you, for a period enabling us to verify
        the accuracy of the personal data;
      </li>
      <li>
        the processing is unlawful and you oppose the erasure of the personal data and request the
        restriction of their use instead;
      </li>
      <li>
        we no longer need the personal data for the purposes of the processing, but they are
        required by you for the establishment, exercise or defense of legal claims; and/or
      </li>
      <li>you have objected to processing pursuant to applicable laws.</li>
    </ul>

    <Heading as="h3">Right to object</Heading>
    <Text as="p">
      You have the right to object at any time, to the processing of your personal data where we are
      relying on a legitimate interest (or those of a third party) as the legal basis for that
      particular use of your data. We shall no longer process the personal data in the event of the
      objection unless we can demonstrate reasonable grounds for the processing, which override the
      interests, rights and freedoms of you, or for the establishment, exercise or defense of legal
      claims.
    </Text>
    <Text as="p">
      You also have the absolute right to object any time to the processing of your personal data
      for direct marketing purposes (see Opting out of marketing above for details of how to object
      to receiving direct marketing communications).
    </Text>

    <Heading as="h3">Right to withdraw data protection consent</Heading>
    <Text as="p">
      You have the right to withdraw your consent to the processing of your personal data at any
      time. However, this will not affect the lawfulness of any processing carried out before you
      withdraw your consent. If you withdraw your consent, we may not be able to provide certain
      products or services to you. We will advise you if this is the case at the time you withdraw
      your consent.
    </Text>
    <Text as="p">
      If you wish to exercise any of the rights set out above, please contact us using the details
      set out in the Contact us section of this Privacy Policy.
    </Text>

    <Heading as="h3">No fee usually required</Heading>
    <Text as="p">
      You will not have to pay a fee to access your personal data (or to exercise any of the other
      rights). However, we may charge a reasonable fee if your request is clearly unfounded,
      repetitive or excessive. Alternatively, we could refuse to comply with your request in these
      circumstances.
    </Text>

    <Heading as="h3">What we may need from you</Heading>
    <Text as="p">
      We may need to request specific information from you to help us confirm your identity and
      ensure your right to access your personal data (or to exercise any of your other rights). This
      is a security measure to ensure that personal data is not disclosed to any person who has no
      right to receive it. We may also contact you to ask you for further information in relation to
      your request to speed up our response.
    </Text>

    <Heading as="h3">Time limit to respond</Heading>
    <Text as="p">
      We try to respond to all legitimate requests within one month. Occasionally it could take us
      longer than a month if your request is particularly complex or you have made a number of
      requests. In this case, we will notify you and keep you updated.
    </Text>

    <Heading as="h2">Conflict or Inconsistency</Heading>
    <Text as="p">
      In the event of any conflict or inconsistency between this Privacy Policy and any non-English
      language translation thereof, the terms and provisions of this Privacy Policy shall control.
    </Text>

    <Heading as="h2">Contact us</Heading>
    <Text as="p">
      Please contact us with questions, comments, or concerns regarding our Privacy Policy as well
      as with any requests at legal@summer.fi.
    </Text>

    <Heading as="h2">Complaints</Heading>
    <Text as="p">
      You have the right to make a complaint at any time to the Information Commissioner’s Office
      (ICO), the UK regulator for data protection issues (www.ico.org.uk). We would, however,
      appreciate the chance to deal with your concerns before you approach the ICO so please contact
      us in the first instance.
    </Text>

    <Heading as="h2">Amendments to this Policy</Heading>
    <Text as="p">
      We may amend this Privacy Policy at any time by posting the amended version on the Site
      including the effective date of the amended version. The current version of the Privacy
      Policy, as published on the Site, is applicable.
    </Text>
    <Text as="p">
      It is important that the personal data we hold about you is accurate and current. Please keep
      us informed if your personal data changes during your relationship with us, for example a new
      address or email address.
    </Text>
  </Box>
)
