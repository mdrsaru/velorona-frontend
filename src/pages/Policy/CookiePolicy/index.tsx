import { Card, Space, Row, Col } from "antd"
import PolicyCard from "../../../components/PolicyCard"
import PolicyList from "../../../components/PolicyList"

import styles from '../PrivacyPolicy/styles.module.scss'

const CookiePolicy = () => {
	const header = {
		title: "Cookies Policy",
		lastUpdated: "July 18, 2022",
	};

	const policyList = [
		{
			title: "Introduction",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum proin lobortis mauris, dictum sit. Cursus eu, augue nibh vitae sed volutpat tempus, orci, elit. Montes, magna proin congue netus commodo mollis egestas libero. Velit rhoncus malesuada eget amet, ultrices non aliquam vitae. Neque diam scelerisque cras nunc. Porta dictum lectus donec in purus, eget nisi sollicitudin est. Auctor id dignissim ipsum sed. Purus, tellus ac non, vestibulum. Faucibus in adipiscing tempus adipiscing lorem. Phasellus tincidunt quis a, semper bibendum lectus amet sapien augue. Hac cursus quam vivamus nibh quis diam a. Elit duis ultrices nibh vestibulum faucibus ullamcorper. Blandit fermentum ultrices sagittis ipsum adipiscing id tempus. Tincidunt fermentum adipiscing sem scelerisque tincidunt. A tellus eget nam nisi varius. Sit at auctor cursus interdum nunc. Consectetur interdum netus turpis semper non. Dolor pretium sit platea dui tincidunt eu morbi. Molestie vitae mauris pulvinar odio ac. Sollicitudin amet ullamcorper mi ac bibendum. Mattis in sit eu non ullamcorper duis purus pharetra ac. Id elit, diam a laoreet. Tempor nec in nulla sed purus enim montes, amet. Nisl, dictum elementum rhoncus pellentesque amet neque. Metus, pulvinar bibendum augue aliquet vestibulum tellus nulla diam est. At arcu in cras cras egestas. Convallis quam nisl tempus nulla malesuada non eleifend aenean lacinia. Senectus congue cursus cras mattis enim. Nulla in sed blandit non platea tempor eget. Et, ut augue platea senectus iaculis elementum. Etiam amet sagittis, dui facilisis ipsum. Pellentesque lectus urna tincidunt molestie elit. Diam tortor et congue scelerisque. Maecenas risus in fermentum varius iaculis elit. Placerat at semper diam egestas a suspendisse habitasse. Dictum adipiscing neque felis risus tempor, leo, ipsum.    Dolor consectetur laoreet amet ultricies pulvinar viverra. Nibh commodo tellus massa feugiat interdum vestibulum a ante urna. Est quam massa massa elementum, justo vitae felis, est nunc. Cras egestas enim enim mauris turpis. Cras lacus, massa cras est, feugiat nulla arcu. Faucibus lectus congue aliquam sed. Vitae fermentum porttitor nunc lectus congue. Dapibus consectetur ac scelerisque ultricies. Sapien mi proin porttitor commodo praesent. Vestibulum, interdum bibendum mi velit adipiscing tincidunt amet nibh. Sed placerat nullam non ornare. Eget consectetur habitasse sem quis est. Nibh faucibus vitae et ipsum cursus molestie neque, eget lectus.    Orci lorem porta ultrices malesuada id viverra volutpat urna. Commodo fermentum, pretium urna, ultricies varius et odio id ante. Fermentum ut lacus velit eu amet nam morbi auctor auctor. Eleifend dolor, congue consectetur turpis scelerisque mauris vitae at. Sollicitudin vestibulum nibh urna facilisis elit. Ac eget convallis cras eget eu, morbi mauris praesent pulvinar.",
		},
		{
			title: "Managing Your Information",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum proin lobortis mauris, dictum sit. Cursus eu, augue nibh vitae sed volutpat tempus, orci, elit. Montes, magna proin congue netus commodo mollis egestas libero. Velit rhoncus malesuada eget amet, ultrices non aliquam vitae. Neque diam scelerisque cras nunc. Porta dictum lectus donec in purus, eget nisi sollicitudin est. Auctor id dignissim ipsum sed. Purus, tellus ac non, vestibulum. Faucibus in adipiscing tempus adipiscing lorem. Phasellus tincidunt quis a, semper bibendum lectus amet sapien augue. Hac cursus quam vivamus nibh quis diam a. Elit duis ultrices nibh vestibulum faucibus ullamcorper. Blandit fermentum ultrices sagittis ipsum adipiscing id tempus. Tincidunt fermentum adipiscing sem scelerisque tincidunt. A tellus eget nam nisi varius. Sit at auctor cursus interdum nunc. Consectetur interdum netus turpis semper non. Dolor pretium sit platea dui tincidunt eu morbi. Molestie vitae mauris pulvinar odio ac. Sollicitudin amet ullamcorper mi ac bibendum. Mattis in sit eu non ullamcorper duis purus pharetra ac. Id elit, diam a laoreet. Tempor nec in nulla sed purus enim montes, amet. Nisl, dictum elementum rhoncus pellentesque amet neque. Metus, pulvinar bibendum augue aliquet vestibulum tellus nulla diam est. At arcu in cras cras egestas. Convallis quam nisl tempus nulla malesuada non eleifend aenean lacinia. Senectus congue cursus cras mattis enim. Nulla in sed blandit non platea tempor eget. Et, ut augue platea senectus iaculis elementum. Etiam amet sagittis, dui facilisis ipsum. Pellentesque lectus urna tincidunt molestie elit. Diam tortor et congue scelerisque. Maecenas risus in fermentum varius iaculis elit. Placerat at semper diam egestas a suspendisse habitasse. Dictum adipiscing neque felis risus tempor, leo, ipsum.    Dolor consectetur laoreet amet ultricies pulvinar viverra. Nibh commodo tellus massa feugiat interdum vestibulum a ante urna. Est quam massa massa elementum, justo vitae felis, est nunc. Cras egestas enim enim mauris turpis. Cras lacus, massa cras est, feugiat nulla arcu. Faucibus lectus congue aliquam sed. Vitae fermentum porttitor nunc lectus congue. Dapibus consectetur ac scelerisque ultricies. Sapien mi proin porttitor commodo praesent. Vestibulum, interdum bibendum mi velit adipiscing tincidunt amet nibh. Sed placerat nullam non ornare. Eget consectetur habitasse sem quis est. Nibh faucibus vitae et ipsum cursus molestie neque, eget lectus.    Orci lorem porta ultrices malesuada id viverra volutpat urna. Commodo fermentum, pretium urna, ultricies varius et odio id ante. Fermentum ut lacus velit eu amet nam morbi auctor auctor. Eleifend dolor, congue consectetur turpis scelerisque mauris vitae at. Sollicitudin vestibulum nibh urna facilisis elit. Ac eget convallis cras eget eu, morbi mauris praesent pulvinar.",
		},
		{
			title: "Security",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum proin lobortis mauris, dictum sit. Cursus eu, augue nibh vitae sed volutpat tempus, orci, elit. Montes, magna proin congue netus commodo mollis egestas libero. Velit rhoncus malesuada eget amet, ultrices non aliquam vitae. Neque diam scelerisque cras nunc. Porta dictum lectus donec in purus, eget nisi sollicitudin est. Auctor id dignissim ipsum sed. Purus, tellus ac non, vestibulum. Faucibus in adipiscing tempus adipiscing lorem. Phasellus tincidunt quis a, semper bibendum lectus amet sapien augue. Hac cursus quam vivamus nibh quis diam a. Elit duis ultrices nibh vestibulum faucibus ullamcorper. Blandit fermentum ultrices sagittis ipsum adipiscing id tempus. Tincidunt fermentum adipiscing sem scelerisque tincidunt. A tellus eget nam nisi varius. Sit at auctor cursus interdum nunc. Consectetur interdum netus turpis semper non. Dolor pretium sit platea dui tincidunt eu morbi. Molestie vitae mauris pulvinar odio ac. Sollicitudin amet ullamcorper mi ac bibendum. Mattis in sit eu non ullamcorper duis purus pharetra ac. Id elit, diam a laoreet. Tempor nec in nulla sed purus enim montes, amet. Nisl, dictum elementum rhoncus pellentesque amet neque. Metus, pulvinar bibendum augue aliquet vestibulum tellus nulla diam est. At arcu in cras cras egestas. Convallis quam nisl tempus nulla malesuada non eleifend aenean lacinia. Senectus congue cursus cras mattis enim. Nulla in sed blandit non platea tempor eget. Et, ut augue platea senectus iaculis elementum. Etiam amet sagittis, dui facilisis ipsum. Pellentesque lectus urna tincidunt molestie elit. Diam tortor et congue scelerisque. Maecenas risus in fermentum varius iaculis elit. Placerat at semper diam egestas a suspendisse habitasse. Dictum adipiscing neque felis risus tempor, leo, ipsum.    Dolor consectetur laoreet amet ultricies pulvinar viverra. Nibh commodo tellus massa feugiat interdum vestibulum a ante urna. Est quam massa massa elementum, justo vitae felis, est nunc. Cras egestas enim enim mauris turpis. Cras lacus, massa cras est, feugiat nulla arcu. Faucibus lectus congue aliquam sed. Vitae fermentum porttitor nunc lectus congue. Dapibus consectetur ac scelerisque ultricies. Sapien mi proin porttitor commodo praesent. Vestibulum, interdum bibendum mi velit adipiscing tincidunt amet nibh. Sed placerat nullam non ornare. Eget consectetur habitasse sem quis est. Nibh faucibus vitae et ipsum cursus molestie neque, eget lectus.    Orci lorem porta ultrices malesuada id viverra volutpat urna. Commodo fermentum, pretium urna, ultricies varius et odio id ante. Fermentum ut lacus velit eu amet nam morbi auctor auctor. Eleifend dolor, congue consectetur turpis scelerisque mauris vitae at. Sollicitudin vestibulum nibh urna facilisis elit. Ac eget convallis cras eget eu, morbi mauris praesent pulvinar.",
		},
	];
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

					<h1>Interpretation and Definitions</h1>
					<h2>Interpretation</h2>
					<p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
					<h2>Definitions</h2>
					<p>For the purposes of this Cookies Policy:</p>
					<ul>
						<li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Cookies Policy) refers to Velorona LLC, 1001 W Euless Boulevard Ste 408, Euless, TX-76040.</li>
						<li><strong>Cookies</strong> means small files that are placed on Your computer, mobile device or any other device by a website, containing details of your browsing history on that website among its many uses.</li>
						<li><strong>Website</strong> refers to Velorona, accessible from <a href="www.velorona.com" rel="external nofollow noopener" target="_blank">www.velorona.com</a></li>
						<li><strong>You</strong> means the individual accessing or using the Website, or a company, or any legal entity on behalf of which such individual is accessing or using the Website, as applicable.</li>
					</ul>
					<h1>The use of the Cookies</h1>
					<h2>Type of Cookies We Use</h2>
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
					<h2>Your Choices Regarding Cookies</h2>
					<p>If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.</p>
					<p>If You do not accept Our Cookies, You may experience some inconvenience in your use of the Website and some features may not function properly.</p>
					<p>If You'd like to delete Cookies or instruct your web browser to delete or refuse Cookies, please visit the help pages of your web browser.</p>
					<ul>
						<li>
							<p>For the Chrome web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" rel="external nofollow noopener" target="_blank">https://support.google.com/accounts/answer/32050</a></p>
						</li>
						<li>
							<p>For the Internet Explorer web browser, please visit this page from Microsoft: <a href="http://support.microsoft.com/kb/278835" rel="external nofollow noopener" target="_blank">http://support.microsoft.com/kb/278835</a></p>
						</li>
						<li>
							<p>For the Firefox web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" rel="external nofollow noopener" target="_blank">https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a></p>
						</li>
						<li>
							<p>For the Safari web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" rel="external nofollow noopener" target="_blank">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></p>
						</li>
					</ul>
					<p>For any other web browser, please visit your web browser's official web pages.</p>
					<h2>More Information about Cookies</h2>
					<p>You can learn more about cookies: <a href="https://www.privacypolicies.com/blog/cookies/" target="_blank">What Are Cookies?</a>.</p>
					<h2>Contact Us</h2>
					<p>If you have any questions about this Cookies Policy, You can contact us:</p>
					<ul>
						<li>By email: <a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="4e272028210e382b22213c21202f602d2123">[email&#160;protected]</a></li>
					</ul><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
					{/* </Row> */}
				</Space>
			</Card>
		</>
	)
}
export default CookiePolicy