import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsPanel } from '../../components/SettingsPanel'

// Mock API module
vi.mock('../../services/api', () => ({
  fetchVoices: vi.fn().mockResolvedValue([
    { id: 'alloy', name: 'Alloy', description: '中性、平衡' },
    { id: 'echo', name: 'Echo', description: '男性、沉稳' },
    { id: 'fable', name: 'Fable', description: '男性、温暖' },
    { id: 'onyx', name: 'Onyx', description: '男性、深沉' },
    { id: 'nova', name: 'Nova', description: '女性、活泼' },
    { id: 'shimmer', name: 'Shimmer', description: '女性、柔和' },
  ]),
}))

describe('SettingsPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedVoice: 'alloy',
    samplingRate: 1,
    onVoiceChange: vi.fn(),
    onSamplingRateChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<SettingsPanel {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('设置')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SettingsPanel {...defaultProps} />)

    expect(screen.getByText('设置')).toBeInTheDocument()
    expect(screen.getByText('AI 语音音色')).toBeInTheDocument()
    expect(screen.getByText('视频帧采样频率')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(<SettingsPanel {...defaultProps} />)

    // Find the close button (X icon)
    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should display voices after loading', async () => {
    render(<SettingsPanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Alloy')).toBeInTheDocument()
      expect(screen.getByText('Echo')).toBeInTheDocument()
    })
  })

  it('should call onVoiceChange when voice is selected', async () => {
    render(<SettingsPanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Echo')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Echo'))
    expect(defaultProps.onVoiceChange).toHaveBeenCalledWith('echo')
  })

  it('should display sampling rate options', () => {
    render(<SettingsPanel {...defaultProps} />)

    expect(screen.getByText('0.5 fps')).toBeInTheDocument()
    expect(screen.getByText('1 fps')).toBeInTheDocument()
    expect(screen.getByText('2 fps')).toBeInTheDocument()
  })

  it('should call onSamplingRateChange when sampling rate is selected', () => {
    render(<SettingsPanel {...defaultProps} />)

    fireEvent.click(screen.getByText('2 fps'))
    expect(defaultProps.onSamplingRateChange).toHaveBeenCalledWith(2)
  })

  it('should display cost control tips', () => {
    render(<SettingsPanel {...defaultProps} />)

    expect(screen.getByText('💡 成本控制提示')).toBeInTheDocument()
  })
})
