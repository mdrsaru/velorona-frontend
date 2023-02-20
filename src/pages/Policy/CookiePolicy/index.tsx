import { Card, Space} from "antd"
import PolicyCard from "../../../components/PolicyCard"

import styles from '../PrivacyPolicy/styles.module.scss'

const CookiePolicy = () => {
	const header = {
		title: "Cookies Policy",
		lastUpdated: "February 16, 2023",
	};
	return (
		<>
			<Card className={styles['card-container']}>
				<Space size={15} direction="vertical">
					<PolicyCard {...header} />
					{/* <Row gutter={[10, 20]}>  */}
					{/* {policyList.map((item, index) => (
                <Col key={item.title + index}>
                  <PolicyList
                    title={item.title}
                    description={item.description}
                  />
                </Col>
              ))} */}
					{/* <Space size={56} direction="vertical"> */}
					<p>This Cookies Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used.</p>
					<p>Cookies do not typically contain any information that personally identifies a user, but personal information that we store about You may be linked to the information stored in and obtained from Cookies. For further information on how We use, store and keep your personal data secure, see our Privacy Policy.</p>
					<p>We do not store sensitive personal information, such as mailing addresses, account passwords, etc. in the Cookies We use.</p>

					<h1 className={styles["topic"]}>Interpretation and Definitions</h1>
					<hr className={styles["topic_line"]}/>
					<h2 className={styles["subtopic"]}>Interpretation</h2>
					<p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
					<h2 className={styles["subtopic"]}>Definitions</h2>
					<p>For the purposes of this Cookies Policy:</p>
					<ul>
						<li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Cookies Policy) refers to Velorona LLC, 1001 W Euless Boulevard Ste 408, Euless, TX-76040.</li>
						<li><strong>Cookies</strong> means small files that are placed on Your computer, mobile device or any other device by a website, containing details of your browsing history on that website among its many uses.</li>
						<li><strong>Website</strong> refers to Velorona, accessible from <a href="www.velorona.com" rel="noreferrer" target="_blank">https://www.velorona.com </a></li>
						<li><strong>You</strong> means the individual accessing or using the Website, or a company, or any legal entity on behalf of which such individual is accessing or using the Website, as applicable.</li>
					</ul>
					<h1 className={styles["topic"]}>The use of the Cookies</h1>
					<hr className={styles["topic_line"]}/>
					<h2> className={styles["subtopic"]}Type of Cookies We Use</h2>
					<p>Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close your web browser.</p>
					<p>We use both session and persistent Cookies for the purposes set out below:</p>
					<ul>
						<li>
							<p><strong>Necessary / Essential Cookies</strong></p>
							<p>Type: Session Cookies</p>
							<p>Administered by: Us</p>
							<p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
						</li>
						<li>
							<p><strong>Cookies Policy / Notice Acceptance Cookies</strong></p>
							<p>Type: Persistent Cookies</p>
							<p>Administered by: Us</p>
							<p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p>
						</li>
						<li>
							<p><strong>Functionality Cookies</strong></p>
							<p>Type: Persistent Cookies</p>
							<p>Administered by: Us</p>
							<p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
						</li>
						<li>
							<p><strong>Tracking and Performance Cookies</strong></p>
							<p>Type: Persistent Cookies</p>
							<p>Administered by: Third-Parties</p>
							<p>Purpose: These Cookies are used to track information about traffic to the Website and how users use the Website. The information gathered via these Cookies may directly or indirectly identify you as an individual visitor. This is because the information collected is typically linked to a pseudonymous identifier associated with the device you use to access the Website. We may also use these Cookies to test new advertisements, pages, features or new functionality of the Website to see how our users react to them.</p>
						</li>
						<li>
							<p><strong>Targeting and Advertising Cookies</strong></p>
							<p>Type: Persistent Cookies</p>
							<p>Administered by: Third-Parties</p>
							<p>Purpose: These Cookies track your browsing habits to enable Us to show advertising which is more likely to be of interest to You. These Cookies use information about your browsing history to group You with other users who have similar interests. Based on that information, and with Our permission, third party advertisers can place Cookies to enable them to show adverts which We think will be relevant to your interests while You are on third party websites.</p>
						</li>
						<li>
							<p><strong>Social Media Cookies</strong></p>
							<p>Type: Persistent Cookies</p>
							<p>Administered by: Third-Parties</p>
							<p>Purpose: In addition to Our own Cookies, We may also use various third parties Cookies to report usage statistics of the Website, deliver advertisements on and through the Website, and so on. These Cookies may be used when You share information using a social media networking website such as Facebook, Instagram, Twitter or Google+.</p>
						</li>
					</ul>
					<h1 className={styles["topic"]}>Your Choices Regarding Cookies</h1>
					<hr className={styles["topic_line"]}/>
					<p>If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.</p>
					<p>If You do not accept Our Cookies, You may experience some inconvenience in your use of the Website and some features may not function properly.</p>
					<p>If You'd like to delete Cookies or instruct your web browser to delete or refuse Cookies, please visit the help pages of your web browser.</p>
					<ul>
						<li>
							<p>For the Chrome web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" rel="noreferrer" target="_blank">https://support.google.com/accounts/answer/32050</a></p>
						</li>
						<li>
							<p>For the Internet Explorer web browser, please visit this page from Microsoft: <a href="http://support.microsoft.com/kb/278835" rel="noreferrer" target="_blank">http://support.microsoft.com/kb/278835</a></p>
						</li>
						<li>
							<p>For the Firefox web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" rel="noreferrer" target="_blank">https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a></p>
						</li>
						<li>
							<p>For the Safari web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" rel="noreferrer" target="_blank">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></p>
						</li>
					</ul>
					<p>For any other web browser, please visit your web browser's official web pages.</p>
					<h2 className={styles["subtopic"]}>More Information about Cookies</h2>
					<p>You can learn more about cookies: <a href="https://www.privacypolicies.com/blog/cookies/" target="_blank" rel="noreferrer">What Are Cookies?</a>.</p>
					<h2 className={styles["subtopic"]}>Contact Us</h2>
					<p>If you have any questions about this Cookies Policy, You can contact us:</p>
					<ul>
					<li>By email: <span className="__cf_email__" data-cfemail="3950575f56794f5c55564b565758175a5654">info@velorona.com </span></li>
					</ul>
					{/* </Row> */}
				</Space>
			</Card>
		</>
	)
}
export default CookiePolicy