import React from 'react'
import { ShowPropertyProps } from 'adminjs'
import { Box } from '@adminjs/design-system'

const PhotoPreview: React.FC<ShowPropertyProps> = (props) => {
  const { record, property } = props
  const url = record?.params?.[property.path]

  if (!url) {
    return <Box>—</Box>
  }

  return (
    <Box>
      <img
        src={url}
        alt="Фото"
        style={{
          maxWidth: '200px',
          maxHeight: '150px',
          objectFit: 'cover',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
        }}
      />
      <Box mt="sm" style={{ fontSize: '11px', color: '#888', wordBreak: 'break-all' }}>
        {url}
      </Box>
    </Box>
  )
}

export default PhotoPreview
