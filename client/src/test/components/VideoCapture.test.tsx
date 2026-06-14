import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VideoCapture } from '../../components/VideoCapture'

describe('VideoCapture', () => {
  const defaultProps = {
    videoRef: { current: null },
    isStreaming: false,
    error: null,
    isFullscreen: false,
    onStartCamera: vi.fn(),
    onStopCamera: vi.fn(),
    onSwitchCamera: vi.fn(),
    onCaptureFrame: vi.fn(),
    onToggleFullscreen: vi.fn(),
  }

  it('should render start camera button when not streaming', () => {
    render(<VideoCapture {...defaultProps} />)

    expect(screen.getByText('开启摄像头')).toBeInTheDocument()
  })

  it('should render stop and switch buttons when streaming', () => {
    render(<VideoCapture {...defaultProps} isStreaming={true} />)

    expect(screen.getByText('关闭')).toBeInTheDocument()
    expect(screen.getByText('切换')).toBeInTheDocument()
  })

  it('should call onStartCamera when start button is clicked', () => {
    render(<VideoCapture {...defaultProps} />)

    fireEvent.click(screen.getByText('开启摄像头'))
    expect(defaultProps.onStartCamera).toHaveBeenCalled()
  })

  it('should call onStopCamera when stop button is clicked', () => {
    render(<VideoCapture {...defaultProps} isStreaming={true} />)

    fireEvent.click(screen.getByText('关闭'))
    expect(defaultProps.onStopCamera).toHaveBeenCalled()
  })

  it('should call onSwitchCamera when switch button is clicked', () => {
    render(<VideoCapture {...defaultProps} isStreaming={true} />)

    fireEvent.click(screen.getByText('切换'))
    expect(defaultProps.onSwitchCamera).toHaveBeenCalled()
  })

  it('should display error message when error exists', () => {
    const error = '无法访问摄像头'
    render(<VideoCapture {...defaultProps} error={error} />)

    expect(screen.getByText(error)).toBeInTheDocument()
  })

  it('should display default message when not streaming and no error', () => {
    render(<VideoCapture {...defaultProps} />)

    expect(screen.getByText('点击下方按钮开启摄像头')).toBeInTheDocument()
  })

  it('should have video element', () => {
    render(<VideoCapture {...defaultProps} />)

    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
  })

  it('should apply mirror transform to video', () => {
    render(<VideoCapture {...defaultProps} />)

    const video = document.querySelector('video')
    expect(video).toHaveStyle({ transform: 'scaleX(-1)' })
  })
})
