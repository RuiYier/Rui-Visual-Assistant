import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ControlBar } from '../../components/ControlBar'

describe('ControlBar', () => {
  const defaultProps = {
    isCameraOn: false,
    isMicOn: false,
    isConnected: false,
    isRecording: false,
    onToggleCamera: vi.fn(),
    onToggleMic: vi.fn(),
    onScreenshot: vi.fn(),
    onClearMessages: vi.fn(),
  }

  it('should render connection status as disconnected', () => {
    render(<ControlBar {...defaultProps} />)

    expect(screen.getByText('未连接')).toBeInTheDocument()
  })

  it('should render connection status as connected', () => {
    render(<ControlBar {...defaultProps} isConnected={true} />)

    expect(screen.getByText('已连接')).toBeInTheDocument()
  })

  it('should render recording indicator when recording', () => {
    render(<ControlBar {...defaultProps} isRecording={true} />)

    expect(screen.getByText('录音中')).toBeInTheDocument()
  })

  it('should not render recording indicator when not recording', () => {
    render(<ControlBar {...defaultProps} isRecording={false} />)

    expect(screen.queryByText('录音中')).not.toBeInTheDocument()
  })

  it('should call onToggleCamera when camera button is clicked', () => {
    render(<ControlBar {...defaultProps} />)

    const cameraButton = screen.getByTitle('开启摄像头')
    fireEvent.click(cameraButton)

    expect(defaultProps.onToggleCamera).toHaveBeenCalled()
  })

  it('should call onToggleMic when mic button is clicked', () => {
    render(<ControlBar {...defaultProps} />)

    const micButton = screen.getByTitle('开启麦克风')
    fireEvent.click(micButton)

    expect(defaultProps.onToggleMic).toHaveBeenCalled()
  })

  it('should call onScreenshot when screenshot button is clicked', () => {
    render(<ControlBar {...defaultProps} isCameraOn={true} />)

    const screenshotButton = screen.getByTitle('截图分析')
    fireEvent.click(screenshotButton)

    expect(defaultProps.onScreenshot).toHaveBeenCalled()
  })

  it('should disable screenshot button when camera is off', () => {
    render(<ControlBar {...defaultProps} isCameraOn={false} />)

    const screenshotButton = screen.getByTitle('截图分析')
    expect(screenshotButton).toBeDisabled()
  })

  it('should call onClearMessages when clear button is clicked', () => {
    render(<ControlBar {...defaultProps} />)

    const clearButton = screen.getByTitle('清空对话')
    fireEvent.click(clearButton)

    expect(defaultProps.onClearMessages).toHaveBeenCalled()
  })

  it('should show active state for camera button when camera is on', () => {
    render(<ControlBar {...defaultProps} isCameraOn={true} />)

    const cameraButton = screen.getByTitle('关闭摄像头')
    expect(cameraButton).toHaveClass('bg-blue-500')
  })

  it('should show active state for mic button when mic is on', () => {
    render(<ControlBar {...defaultProps} isMicOn={true} />)

    const micButton = screen.getByTitle('关闭麦克风')
    expect(micButton).toHaveClass('bg-blue-500')
  })
})
