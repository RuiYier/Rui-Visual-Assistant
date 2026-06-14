import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatPanel } from '../../components/ChatPanel'

describe('ChatPanel', () => {
  const defaultProps = {
    messages: [],
    currentTranscript: '',
    currentResponse: '',
    isProcessing: false,
  }

  it('should render empty state', () => {
    render(<ChatPanel {...defaultProps} />)

    expect(screen.getByText('开始对话吧！')).toBeInTheDocument()
    expect(screen.getByText('打开摄像头和麦克风，对着摄像头说话')).toBeInTheDocument()
  })

  it('should render user messages', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: '你好',
        timestamp: Date.now(),
      },
    ]

    render(<ChatPanel {...defaultProps} messages={messages} />)

    expect(screen.getByText('你好')).toBeInTheDocument()
  })

  it('should render assistant messages', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant' as const,
        content: '你好！有什么可以帮助你的吗？',
        timestamp: Date.now(),
      },
    ]

    render(<ChatPanel {...defaultProps} messages={messages} />)

    expect(screen.getByText('你好！有什么可以帮助你的吗？')).toBeInTheDocument()
  })

  it('should render current transcript', () => {
    render(<ChatPanel {...defaultProps} currentTranscript="正在说话..." />)

    expect(screen.getByText('正在说话...')).toBeInTheDocument()
    expect(screen.getByText('正在识别...')).toBeInTheDocument()
  })

  it('should render current response with processing indicator', () => {
    render(
      <ChatPanel
        {...defaultProps}
        currentResponse="正在思考..."
        isProcessing={true}
      />
    )

    expect(screen.getByText('正在思考...')).toBeInTheDocument()
    expect(screen.getByText('思考中...')).toBeInTheDocument()
  })

  it('should render current response without processing indicator', () => {
    render(
      <ChatPanel
        {...defaultProps}
        currentResponse="AI回复"
        isProcessing={false}
      />
    )

    expect(screen.getByText('AI回复')).toBeInTheDocument()
    expect(screen.queryByText('思考中...')).not.toBeInTheDocument()
  })

  it('should render multiple messages in order', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: '第一条消息',
        timestamp: Date.now() - 1000,
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: '第二条消息',
        timestamp: Date.now(),
      },
    ]

    render(<ChatPanel {...defaultProps} messages={messages} />)

    const messageElements = screen.getAllByText(/消息/)
    expect(messageElements).toHaveLength(2)
  })
})
