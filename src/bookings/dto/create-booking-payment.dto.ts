import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingPaymentDto {
  @ApiProperty({
    description: 'ID платежа в базе',
    example: 42,
  })
  paymentId!: number;

  @ApiProperty({
    description: 'ID платежа в ЮKassa',
    example: '22c5d173-000f-5000-9000-1bdf241d4651',
  })
  providerPaymentId!: string;

  @ApiProperty({
    description: 'Статус платежа',
    example: 'pending',
  })
  status!: string;

  @ApiProperty({
    description: 'Ссылка на подтверждение оплаты',
    example:
      'https://yoomoney.ru/payments/external/confirmation?orderId=example',
  })
  confirmationUrl?: string;
}
