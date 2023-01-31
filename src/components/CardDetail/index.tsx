import { gql, useMutation } from '@apollo/client';
import { Card, Col, message, Radio, Row, Spin } from 'antd';
import CreditCard from '../../assets/images/creditCard.png'
import { notifyGraphqlError } from '../../utils/error';

interface IProps {
	cardDetail: any;
	hideModal: any;
	handleCardSelect: any;
}


const CardDetail = (props: IProps) => {
	const card = props.cardDetail;

	return (
		<Card onClick={() => props.handleCardSelect(card)}>
			<Radio>
			<Row>
				<Col>
					<img src={CreditCard} width='100px' />
				</Col>
				<Col style={{ marginLeft: '2rem' }}>
					<b>**** {card?.card?.last4}</b>
					<p>{card?.card?.brand}</p>
					<p>{card?.card?.exp_month}/{card?.card?.exp_year}</p>
				</Col>
			</Row>
			</Radio>
		</Card>

	)
}

export default CardDetail