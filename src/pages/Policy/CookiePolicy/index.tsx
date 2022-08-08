import { Card, Space, Row, Col } from "antd"
import PolicyCard from "../../../components/PolicyCard"
import PolicyList from "../../../components/PolicyList"

import styles from '../PrivacyPolicy/styles.module.scss'

const CookiePolicy = () =>{
	const header = {
		title: "Cookies Policy",
		lastUpdated: "August 3, 2022",
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
	return(
		<>
			<Card className={styles['card-container']}>
		  <Space size={56} direction="vertical">
            <PolicyCard {...header} />
            <Row gutter={[10, 20]}>
              {policyList.map((item, index) => (
                <Col key={item.title + index}>
                  <PolicyList
                    title={item.title}
                    description={item.description}
                  />
                </Col>
              ))}
            </Row>
          </Space>
		</Card>
		</>
	)
}
export default CookiePolicy