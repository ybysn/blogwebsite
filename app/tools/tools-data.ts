export interface ToolInfo {
  slug: string
  name: string
  desc: string
  icon: string
}

export const TOOLS: ToolInfo[] = [
  {
    slug: 'json',
    name: 'JSON 格式化',
    desc: '格式化、验证 JSON 数据',
    icon: '{ }',
  },
  {
    slug: 'base64',
    name: 'Base64',
    desc: 'Base64 编码与解码',
    icon: '64',
  },
  {
    slug: 'url',
    name: 'URL 编解码',
    desc: 'URL 编码与解码',
    icon: '%',
  },
  {
    slug: 'uuid',
    name: 'UUID 生成器',
    desc: '生成 UUID v4',
    icon: '#',
  },
  {
    slug: 'timestamp',
    name: '时间戳',
    desc: 'Unix 时间戳转换',
    icon: '@',
  },
  {
    slug: 'jwt',
    name: 'JWT 解码',
    desc: '解码 JWT Token',
    icon: 'J',
  },
  {
    slug: 'color',
    name: '颜色转换',
    desc: 'HEX / RGB / HSL 互转',
    icon: '🎨',
  },
]
