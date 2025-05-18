import { Box } from '@chakra-ui/react'
import { useEffect } from 'react'

export interface FullScreenExpandableBoxProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  onClose?: () => void;
}

export const ExpandableBox = ({
  children,
  isExpanded = false,
  onClose,
}: FullScreenExpandableBoxProps) => {

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault()
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded, onClose])

  return (
    <>
      {isExpanded && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.7)"
          zIndex={1000}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose?.()
            }
          }}
        />
      )}
      <Box
        position={isExpanded ? 'fixed' : 'relative'}
        top={isExpanded ? '50%' : 'auto'}
        left={isExpanded ? '50%' : 'auto'}
        transform={isExpanded ? 'translate(-50%, -50%)' : 'none'}
        zIndex={isExpanded ? 1001 : 'auto'}
        transition="all 0.3s ease"
      >
        {children}
      </Box>
    </>
  )
}
