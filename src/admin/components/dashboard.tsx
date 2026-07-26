import React from 'react'
import { Box, H2, Text, Illustration } from '@adminjs/design-system'

const Dashboard: React.FC = () => {
  return (
    <Box
      flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '60vh' }}
    >
      <Illustration variant="Rocket" width={120} height={120} />
      <H2 mt="xl">Добро пожаловать в панель управления</H2>
      <Text mt="default" textAlign="center" color="grey60">
        Используйте меню слева для управления данными
      </Text>
    </Box>
  )
}

export default Dashboard
