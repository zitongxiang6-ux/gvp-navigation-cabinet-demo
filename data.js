(function initializeDemoData(global) {
  "use strict";

  const locations = [
    {
      id: "building-a",
      name: "1号楼",
      rooms: [
        { id: "room-a101", name: "101 大堂" },
        { id: "room-a102", name: "102 会议室" },
        { id: "room-a103", name: "103 开放办公区" },
        { id: "room-a104", name: "104 走廊" },
      ],
    },
    {
      id: "building-b",
      name: "2号楼",
      rooms: [
        { id: "room-b201", name: "201 设备间" },
        { id: "room-b202", name: "202 培训室" },
        { id: "room-b203", name: "203 办公区" },
      ],
    },
  ];

  const components = [
    { id: "cmp-001", name: "大堂主灯", remark: "入口区域", type: "照明", controlType: "switch", page: "101 大堂", roomId: "room-a101", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-002", name: "大堂筒灯", remark: "接待台", type: "照明", controlType: "cct", page: "101 大堂", roomId: "room-a101", state: "off", deviceStatus: "offline", cabinetId: "cab-001", brightness: 72, temperature: 4200 },

    { id: "cmp-101", name: "Chandelier 1", remark: "吊灯 1", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-102", name: "Chandelier 2", remark: "吊灯 2", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-103", name: "Chandelier 3", remark: "吊灯 3", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "offline", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-104", name: "Chandelier 4", remark: "吊灯 4", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-105", name: "Spotlight 1", remark: "射灯 1", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-106", name: "Spotlight 2", remark: "射灯 2", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "offline", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-107", name: "Spotlight 3", remark: "射灯 3", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-108", name: "Spotlight 4", remark: "射灯 4", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "offline", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-109", name: "RGB1", remark: "氛围灯 1", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-002", brightness: 80, hue: 8 },
    { id: "cmp-110", name: "RGB2", remark: "氛围灯 2", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-003", brightness: 72, hue: 18 },
    { id: "cmp-111", name: "RGB3", remark: "氛围灯 3", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-003", brightness: 66, hue: 52 },
    { id: "cmp-112", name: "RGB4", remark: "氛围灯 4", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "off", deviceStatus: "offline", cabinetId: "cab-003", brightness: 64, hue: 84 },
    { id: "cmp-113", name: "CCT Light 1", remark: "色温灯 1", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-003", brightness: 88, temperature: 5533 },
    { id: "cmp-114", name: "CCT Light 2", remark: "色温灯 2", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "offline", cabinetId: "cab-003", brightness: 82, temperature: 3000 },
    { id: "cmp-115", name: "CCT Light 3", remark: "色温灯 3", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "off", deviceStatus: "offline", cabinetId: "cab-004", brightness: 75, temperature: 3000 },
    { id: "cmp-116", name: "CCT Light 4", remark: "色温灯 4", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-004", brightness: 70, temperature: 3000 },
    { id: "cmp-117", name: "会议室空调", remark: "东侧内机", type: "空调", controlType: "hvac", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "offline", cabinetId: "cab-004", setpoint: 24, mode: "cool", fanSpeed: "medium" },
    { id: "cmp-118", name: "会议室窗帘", remark: "投影幕侧", type: "窗帘", controlType: "curtain", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-004", position: 65, command: "stop" },

    { id: "cmp-005", name: "办公区主灯 A", remark: "工位 1-12", type: "照明", controlType: "switch", page: "103 开放办公区", roomId: "room-a103", state: "on", deviceStatus: "online", cabinetId: "cab-004", brightness: 100 },
    { id: "cmp-006", name: "办公区主灯 B", remark: "工位 13-24", type: "色温照明", controlType: "cct", page: "103 开放办公区", roomId: "room-a103", state: "off", deviceStatus: "online", cabinetId: "cab-005", brightness: 70, temperature: 4000 },
    { id: "cmp-007", name: "办公区窗帘", remark: "南侧", type: "窗帘", controlType: "curtain", page: "103 开放办公区", roomId: "room-a103", state: "on", deviceStatus: "offline", cabinetId: "cab-005", position: 80, command: "stop" },
    { id: "cmp-008", name: "走廊灯组 1", remark: "西段", type: "照明", controlType: "switch", page: "104 走廊", roomId: "room-a104", state: "on", deviceStatus: "online", cabinetId: "cab-005", brightness: 100 },
    { id: "cmp-009", name: "走廊灯组 2", remark: "东段", type: "照明", controlType: "switch", page: "104 走廊", roomId: "room-a104", state: "off", deviceStatus: "offline", cabinetId: "cab-005", brightness: 100 },
    { id: "cmp-010", name: "设备间主灯", remark: "配电柜上方", type: "照明", controlType: "switch", page: "201 设备间", roomId: "room-b201", state: "on", deviceStatus: "online", cabinetId: "cab-005", brightness: 100 },
    { id: "cmp-011", name: "设备间排风", remark: "北墙", type: "通风", controlType: "fan", page: "201 设备间", roomId: "room-b201", state: "on", deviceStatus: "online", cabinetId: "cab-006", fanSpeed: "2" },
    { id: "cmp-012", name: "培训室灯组", remark: "讲台区", type: "色温照明", controlType: "cct", page: "202 培训室", roomId: "room-b202", state: "off", deviceStatus: "offline", cabinetId: "cab-006", brightness: 74, temperature: 4500 },
    { id: "cmp-013", name: "培训室空调", remark: "双机联控", type: "空调", controlType: "hvac", page: "202 培训室", roomId: "room-b202", state: "on", deviceStatus: "online", cabinetId: "cab-006", setpoint: 25, mode: "auto", fanSpeed: "auto" },
    { id: "cmp-014", name: "办公区灯组 C", remark: "南侧工位", type: "RGB 照明", controlType: "rgb", page: "203 办公区", roomId: "room-b203", state: "on", deviceStatus: "online", cabinetId: null, brightness: 78, hue: 62 },
    { id: "cmp-015", name: "办公区新风", remark: "回风口", type: "通风", controlType: "fan", page: "203 办公区", roomId: "room-b203", state: "off", deviceStatus: "offline", cabinetId: null, fanSpeed: "1" },
  ];

  const cabinets = [
    { id: "cab-001", name: "电箱8", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 20, updatedAt: "2026-08-26 16:36" },
    { id: "cab-002", name: "电箱7", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 31, updatedAt: "2026-08-26 16:36" },
    { id: "cab-003", name: "电箱6", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 42, updatedAt: "2026-08-26 16:36" },
    { id: "cab-004", name: "电箱5", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 53, updatedAt: "2026-08-26 16:36" },
    { id: "cab-005", name: "电箱4", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 64, updatedAt: "2026-08-26 16:36" },
    { id: "cab-006", name: "电箱3", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 75, updatedAt: "2026-08-26 16:36" },
  ];

  const devices = [
    { id: "dev-001", remark: "0/1/145", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-001"], roomId: "room-a101" },
    { id: "dev-002", remark: "0/1/169", type: "照明", status: "offline", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-001"], roomId: "room-a102" },
    { id: "dev-003", remark: "0/1/255", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-002"], roomId: "room-a102" },
    { id: "dev-004", remark: "0/1/237", type: "照明", status: "offline", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-002"], roomId: "room-a104" },
    { id: "dev-005", remark: "0/2/25", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-003"], roomId: "room-a102" },
    { id: "dev-006", remark: "0/1/109", type: "照明", status: "offline", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: [], roomId: "room-b203" },
    { id: "dev-007", remark: "0/1/247", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-003"], roomId: "room-b203" },
    { id: "dev-008", remark: "0/1/243", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-004"], roomId: "room-a102" },
    { id: "dev-009", remark: "0/1/245", type: "照明", status: "offline", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-004"], roomId: "room-a103" },
    { id: "dev-010", remark: "0/2/25", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-005"], roomId: "room-a104" },
  ];

  const history = [
    { id: "his-001", type: "设备离线", at: "2026-08-25 16:22:12", message: "[1号楼 / 102 会议室 / 1号楼会议室配电箱] 会议室空调离线", ip: "224.0.23.12", cabinetId: "cab-001" },
    { id: "his-002", type: "应用操作", at: "2026-08-25 16:21:48", message: "admin 控制大堂主灯：打开" },
    { id: "his-003", type: "设备离线", at: "2026-08-25 16:18:05", message: "[1号楼 / 104 走廊 / 1号楼公共区域应急照明配电箱（东区）] 走廊灯组2离线", ip: "224.0.23.16", cabinetId: "cab-002" },
    { id: "his-004", type: "应用操作", at: "2026-08-25 16:12:28", message: "admin 编辑组件：办公区主灯 A" },
    { id: "his-005", type: "系统操作", at: "2026-08-25 15:46:17", message: "外部平台同步设备“大堂主照明”的配电箱关联" },
    { id: "his-006", type: "设备离线", at: "2026-08-25 15:38:40", message: "[2号楼 / 203 办公区 / 2号楼办公区配电箱] 办公区新风离线", ip: "224.0.23.15", cabinetId: "cab-003" },
    { id: "his-007", type: "应用操作", at: "2026-08-25 15:22:03", message: "admin 控制培训室灯组：关闭" },
    { id: "his-008", type: "系统操作", at: "2026-08-25 15:18:09", message: "外部平台同步配电箱资料：1号楼一层照明配电箱" },
    { id: "his-009", type: "设备离线", at: "2026-08-25 14:57:22", message: "室外景观灯离线", ip: "224.0.23.18" },
    { id: "his-010", type: "应用操作", at: "2026-08-25 14:31:18", message: "admin 修改设备监测状态" },
    { id: "his-011", type: "设备离线", at: "2026-08-25 13:26:51", message: "[2号楼 / 201 设备间 / 2号楼设备间配电箱] 设备间排风离线", ip: "224.0.23.17", cabinetId: "cab-004" },
    { id: "his-012", type: "系统操作", at: "2026-08-25 12:12:43", message: "外部平台同步新增配电箱：1号楼备用配电箱" },
    { id: "his-013", type: "应用操作", at: "2026-08-25 11:44:08", message: "admin 控制办公区窗帘：打开" },
    { id: "his-014", type: "设备离线", at: "2026-08-25 11:03:37", message: "[1号楼 / 101 大堂 / 1号楼一层照明配电箱] 门厅照度传感器离线", ip: "224.0.23.19", cabinetId: "cab-005" },
    { id: "his-015", type: "应用操作", at: "2026-08-25 10:48:26", message: "admin 控制会议室灯带：打开" },
    { id: "his-016", type: "系统操作", at: "2026-08-25 10:16:11", message: "外部平台同步配电箱状态：2号楼培训室配电箱已停用" },
    { id: "his-017", type: "设备离线", at: "2026-08-24 18:42:09", message: "[1号楼 / 103 开放办公区 / 1号楼办公区照明配电箱] 办公区灯组A离线", ip: "224.0.23.14", cabinetId: "cab-004" },
    { id: "his-018", type: "应用操作", at: "2026-08-24 17:40:22", message: "admin 控制走廊灯组1：打开" },
    { id: "his-019", type: "设备离线", at: "2026-08-24 16:12:05", message: "[1号楼 / 102 会议室 / 1号楼会议室配电箱] 会议室空调温控器离线", ip: "224.0.23.13", cabinetId: "cab-001" },
    { id: "his-020", type: "系统操作", at: "2026-08-24 15:33:48", message: "admin 修改设备 IP" },
    { id: "his-021", type: "应用操作", at: "2026-08-24 14:51:39", message: "admin 编辑组件：培训室空调" },
    { id: "his-022", type: "设备离线", at: "2026-08-24 13:27:16", message: "[2号楼 / 203 办公区 / 2号楼办公区配电箱] 办公区灯组C离线", ip: "224.0.23.15", cabinetId: "cab-003" },
    { id: "his-023", type: "应用操作", at: "2026-08-24 11:10:04", message: "admin 控制大堂筒灯：关闭" },
    { id: "his-024", type: "系统操作", at: "2026-08-24 09:36:55", message: "外部平台同步解除设备与配电箱关联" },
  ];

  const energyRecords = [
    { month: "2025-08", total: 10120, lighting: 3036, socket: 5566, hvac: 1518 },
    { month: "2025-09", total: 10960, lighting: 3288, socket: 6028, hvac: 1644 },
    { month: "2025-10", total: 11480, lighting: 3444, socket: 6314, hvac: 1722 },
    { month: "2025-11", total: 10860, lighting: 3258, socket: 5973, hvac: 1629 },
    { month: "2025-12", total: 10520, lighting: 3156, socket: 5786, hvac: 1578 },
    { month: "2026-01", total: 11240, lighting: 3372, socket: 6182, hvac: 1686 },
    { month: "2026-02", total: 10780, lighting: 3234, socket: 5929, hvac: 1617 },
    { month: "2026-03", total: 12150, lighting: 3645, socket: 6682, hvac: 1823 },
    { month: "2026-04", total: 10950, lighting: 3285, socket: 6022, hvac: 1643 },
    { month: "2026-05", total: 11820, lighting: 3546, socket: 6501, hvac: 1773 },
    { month: "2026-06", total: 11640, lighting: 3492, socket: 6402, hvac: 1746 },
    { month: "2026-07", total: 11380, lighting: 3414, socket: 6259, hvac: 1707 },
    { month: "2026-08", total: 11220, lighting: 3366, socket: 6171, hvac: 1683 },
    { month: "2026-09", total: 12240, lighting: 3672, socket: 6732, hvac: 1836 },
    { month: "2026-10", total: 12860, lighting: 3858, socket: 7073, hvac: 1929 },
  ];

  const energyTypes = [
    { id: "lighting", name: "照明", builtIn: true, enabled: true },
    { id: "socket", name: "插座", builtIn: true, enabled: true },
    { id: "hvac", name: "空调", builtIn: true, enabled: true },
    { id: "other", name: "其他", builtIn: true, enabled: true },
    { id: "power", name: "动力", builtIn: false, enabled: true },
    { id: "elevator", name: "电梯", builtIn: false, enabled: true },
  ];

  const energyAreas = [
    {
      id: "energy-area-building-1",
      name: "1号楼",
      value: "1号楼",
      children: [
        { id: "energy-area-building-1-floor-1", name: "一楼", value: "1号楼 / 一楼", children: [
          { id: "energy-area-building-1-floor-1-lobby", name: "大堂", value: "1号楼 / 一楼 / 大堂" },
          { id: "energy-area-building-1-floor-1-room-102", name: "102会议室", value: "1号楼 / 一楼 / 102会议室" },
        ] },
        { id: "energy-area-building-1-floor-2", name: "二楼", value: "1号楼 / 二楼", children: [
          { id: "energy-area-building-1-floor-2-office-201", name: "201办公室", value: "1号楼 / 二楼 / 201办公室" },
          { id: "energy-area-building-1-floor-2-room-202", name: "202会议室", value: "1号楼 / 二楼 / 202会议室" },
        ] },
        { id: "energy-area-building-1-floor-3", name: "三楼", value: "1号楼 / 三楼", children: [
          { id: "energy-area-building-1-floor-3-office-301", name: "301开放办公区", value: "1号楼 / 三楼 / 301开放办公区" },
        ] },
        { id: "energy-area-building-1-public", name: "公共区", value: "1号楼 / 公共区" },
        { id: "energy-area-building-1-elevator", name: "电梯", value: "1号楼 / 电梯" },
      ],
    },
    {
      id: "energy-area-building-2",
      name: "2号楼",
      value: "2号楼",
      children: [
        { id: "energy-area-building-2-floor-1", name: "一楼", value: "2号楼 / 一楼", children: [
          { id: "energy-area-building-2-floor-1-room-101", name: "101教室", value: "2号楼 / 一楼 / 101教室" },
        ] },
        { id: "energy-area-building-2-floor-2", name: "二楼", value: "2号楼 / 二楼", children: [
          { id: "energy-area-building-2-floor-2-room-202", name: "202培训室", value: "2号楼 / 二楼 / 202培训室" },
          { id: "energy-area-building-2-floor-2-office-203", name: "203办公室", value: "2号楼 / 二楼 / 203办公室" },
        ] },
        { id: "energy-area-building-2-floor-3", name: "三楼", value: "2号楼 / 三楼", children: [
          { id: "energy-area-building-2-floor-3-room-301", name: "301会议室", value: "2号楼 / 三楼 / 301会议室" },
        ] },
        { id: "energy-area-building-2-public", name: "公共区", value: "2号楼 / 公共区" },
      ],
    },
    {
      id: "energy-area-campus",
      name: "园区",
      value: "园区",
      children: [
        { id: "energy-area-campus-outdoor", name: "室外", value: "园区 / 室外" },
      ],
    },
  ];

  const energyDevices = [
    { id: "energy-device-meter-03", remark: "1号楼备用电表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "AMC96L-E4/KC", product: "安科瑞三相电能表", sourceType: "安科瑞电表", deviceName: "安科瑞多回路电表 03", navigationArea: "1号楼 / 公共区" },
    { id: "energy-device-meter-04", remark: "A区总配电表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "AMC96L-E4/KC", product: "安科瑞三相电能表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 04", navigationArea: "1号楼 / 201 设备间" },
    { id: "energy-device-meter-06", remark: "B区动力电表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "DTSD1352", product: "安科瑞多功能电表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 06", navigationArea: "2号楼 / 201 设备间" },
    { id: "energy-device-breaker-07", remark: "1号楼电梯空开", deviceType: "空开", status: "online", protocol: "MQTT", model: "ZY-AFDD-63", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 A / 智能空开 07", navigationArea: "1号楼 / 201 设备间" },
    { id: "energy-device-breaker-09", remark: "2号楼空调空开", deviceType: "空开", status: "offline", protocol: "MQTT", model: "ZY-MCB-100", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 B / 智能空开 09", navigationArea: "2号楼 / 201 设备间" },
    { id: "energy-device-breaker-03", remark: "室外景观空开", deviceType: "空开", status: "offline", protocol: "MQTT", model: "ZY-AFDD-63", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 C / 智能空开 03", navigationArea: "园区 / 室外" },
    { id: "energy-device-meter-11", remark: "1号楼照明分表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "AMC96L-E4/KC", product: "安科瑞三相电能表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 11", navigationArea: "1号楼 / 一楼" },
    { id: "energy-device-meter-12", remark: "1号楼空调分表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "DTSD1352", product: "安科瑞多功能电表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 12", navigationArea: "1号楼 / 公共区" },
    { id: "energy-device-meter-13", remark: "2号楼办公分表", deviceType: "电表", status: "offline", protocol: "Modbus TCP", model: "AMC96L-E4/KC", product: "安科瑞三相电能表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 13", navigationArea: "2号楼 / 二楼" },
    { id: "energy-device-meter-14", remark: "2号楼商业分表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "DTSD1352", product: "安科瑞多功能电表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 14", navigationArea: "2号楼 / 公共区" },
    { id: "energy-device-meter-15", remark: "园区充电桩电表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "AEM96", product: "安科瑞导轨式电能表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 15", navigationArea: "园区 / 室外" },
    { id: "energy-device-breaker-15", remark: "1号楼消防泵空开", deviceType: "空开", status: "online", protocol: "MQTT", model: "ZY-AFDD-63", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 A / 智能空开 15", navigationArea: "1号楼 / 公共区" },
    { id: "energy-device-breaker-16", remark: "1号楼大堂照明空开", deviceType: "空开", status: "online", protocol: "MQTT", model: "ZY-MCB-100", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 A / 智能空开 16", navigationArea: "1号楼 / 一楼 / 大堂" },
    { id: "energy-device-breaker-17", remark: "2号楼茶水间空开", deviceType: "空开", status: "online", protocol: "MQTT", model: "ZY-AFDD-63", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 B / 智能空开 17", navigationArea: "2号楼 / 二楼" },
    { id: "energy-device-breaker-18", remark: "2号楼排风机空开", deviceType: "空开", status: "offline", protocol: "MQTT", model: "ZY-MCB-100", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 B / 智能空开 18", navigationArea: "2号楼 / 公共区" },
    { id: "energy-device-breaker-19", remark: "园区喷泉空开", deviceType: "空开", status: "online", protocol: "MQTT", model: "ZY-AFDD-63", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 C / 智能空开 19", navigationArea: "园区 / 室外" },
  ];

  const energyDeviceFunctions = [
    { id: "meter-03-function-01", deviceId: "energy-device-meter-03", name: "备用馈线 1", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼备用电表", deviceName: "安科瑞多回路电表 03", floorNode: "1号楼 → 公共区", circuit: "设备功能 01" },
    { id: "meter-03-function-02", deviceId: "energy-device-meter-03", name: "备用馈线 2", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼备用电表", deviceName: "安科瑞多回路电表 03", floorNode: "1号楼 → 公共区", circuit: "设备功能 02" },
    { id: "meter-03-function-03", deviceId: "energy-device-meter-03", name: "备用馈线 3", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼备用电表", deviceName: "安科瑞多回路电表 03", floorNode: "1号楼 → 公共区", circuit: "设备功能 03" },
    { id: "meter-04-function-01", deviceId: "energy-device-meter-04", name: "X7-卡布灯箱", functionType: "开关", page: "1号楼能源管理", deviceRemark: "A区总配电表", deviceName: "安科瑞三相电表 04", floorNode: "1号楼 → 201 设备间", circuit: "设备功能 01" },
    { id: "meter-04-function-02", deviceId: "energy-device-meter-04", name: "X5-卡布灯箱", functionType: "开关", page: "1号楼能源管理", deviceRemark: "A区总配电表", deviceName: "安科瑞三相电表 04", floorNode: "1号楼 → 201 设备间", circuit: "设备功能 02" },
    { id: "meter-04-function-03", deviceId: "energy-device-meter-04", name: "X2-卡布灯箱", functionType: "开关", page: "1号楼能源管理", deviceRemark: "A区总配电表", deviceName: "安科瑞三相电表 04", floorNode: "1号楼 → 201 设备间", circuit: "设备功能 03" },
    { id: "meter-06-function-01", deviceId: "energy-device-meter-06", name: "一层公共照明", functionType: "电能", page: "2号楼能源管理", deviceRemark: "B区动力电表", deviceName: "安科瑞三相电表 06", floorNode: "2号楼 → 201 设备间", circuit: "设备功能 01" },
    { id: "meter-06-function-02", deviceId: "energy-device-meter-06", name: "二层办公插座", functionType: "电能", page: "2号楼能源管理", deviceRemark: "B区动力电表", deviceName: "安科瑞三相电表 06", floorNode: "2号楼 → 201 设备间", circuit: "设备功能 02" },
    { id: "meter-06-function-03", deviceId: "energy-device-meter-06", name: "公共区域空调", functionType: "电能", page: "2号楼能源管理", deviceRemark: "B区动力电表", deviceName: "安科瑞三相电表 06", floorNode: "2号楼 → 201 设备间", circuit: "设备功能 03" },
    { id: "breaker-07-energy", deviceId: "energy-device-breaker-07", name: "正向有功电能", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼电梯空开", deviceName: "众源智能空开 07", floorNode: "1号楼 → 201 设备间", circuit: "空开回路 07" },
    { id: "breaker-09-energy", deviceId: "energy-device-breaker-09", name: "正向有功电能", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼空调空开", deviceName: "众源智能空开 09", floorNode: "2号楼 → 201 设备间", circuit: "空开回路 09" },
    { id: "breaker-03-energy", deviceId: "energy-device-breaker-03", name: "正向有功电能", functionType: "电能", page: "园区能源管理", deviceRemark: "室外景观空开", deviceName: "众源智能空开 03", floorNode: "园区 → 室外", circuit: "空开回路 03" },
    { id: "meter-11-function-01", deviceId: "energy-device-meter-11", name: "一层照明馈线 1", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼照明分表", deviceName: "安科瑞三相电表 11", floorNode: "1号楼 → 一楼", circuit: "设备功能 01" },
    { id: "meter-11-function-02", deviceId: "energy-device-meter-11", name: "一层照明馈线 2", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼照明分表", deviceName: "安科瑞三相电表 11", floorNode: "1号楼 → 一楼", circuit: "设备功能 02" },
    { id: "meter-11-function-03", deviceId: "energy-device-meter-11", name: "一层应急照明", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼照明分表", deviceName: "安科瑞三相电表 11", floorNode: "1号楼 → 一楼", circuit: "设备功能 03" },
    { id: "meter-12-function-01", deviceId: "energy-device-meter-12", name: "空调主机 1", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼空调分表", deviceName: "安科瑞三相电表 12", floorNode: "1号楼 → 公共区", circuit: "设备功能 01" },
    { id: "meter-12-function-02", deviceId: "energy-device-meter-12", name: "空调主机 2", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼空调分表", deviceName: "安科瑞三相电表 12", floorNode: "1号楼 → 公共区", circuit: "设备功能 02" },
    { id: "meter-12-function-03", deviceId: "energy-device-meter-12", name: "冷却塔", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼空调分表", deviceName: "安科瑞三相电表 12", floorNode: "1号楼 → 公共区", circuit: "设备功能 03" },
    { id: "meter-13-function-01", deviceId: "energy-device-meter-13", name: "办公插座东区", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼办公分表", deviceName: "安科瑞三相电表 13", floorNode: "2号楼 → 二楼", circuit: "设备功能 01" },
    { id: "meter-13-function-02", deviceId: "energy-device-meter-13", name: "办公插座西区", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼办公分表", deviceName: "安科瑞三相电表 13", floorNode: "2号楼 → 二楼", circuit: "设备功能 02" },
    { id: "meter-13-function-03", deviceId: "energy-device-meter-13", name: "会议室插座", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼办公分表", deviceName: "安科瑞三相电表 13", floorNode: "2号楼 → 二楼", circuit: "设备功能 03" },
    { id: "meter-14-function-01", deviceId: "energy-device-meter-14", name: "商业照明", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼商业分表", deviceName: "安科瑞三相电表 14", floorNode: "2号楼 → 公共区", circuit: "设备功能 01" },
    { id: "meter-14-function-02", deviceId: "energy-device-meter-14", name: "商业插座", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼商业分表", deviceName: "安科瑞三相电表 14", floorNode: "2号楼 → 公共区", circuit: "设备功能 02" },
    { id: "meter-14-function-03", deviceId: "energy-device-meter-14", name: "商业空调", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼商业分表", deviceName: "安科瑞三相电表 14", floorNode: "2号楼 → 公共区", circuit: "设备功能 03" },
    { id: "meter-15-function-01", deviceId: "energy-device-meter-15", name: "充电区 A", functionType: "电能", page: "园区能源管理", deviceRemark: "园区充电桩电表", deviceName: "安科瑞三相电表 15", floorNode: "园区 → 室外", circuit: "设备功能 01" },
    { id: "meter-15-function-02", deviceId: "energy-device-meter-15", name: "充电区 B", functionType: "电能", page: "园区能源管理", deviceRemark: "园区充电桩电表", deviceName: "安科瑞三相电表 15", floorNode: "园区 → 室外", circuit: "设备功能 02" },
    { id: "meter-15-function-03", deviceId: "energy-device-meter-15", name: "充电运营机房", functionType: "电能", page: "园区能源管理", deviceRemark: "园区充电桩电表", deviceName: "安科瑞三相电表 15", floorNode: "园区 → 室外", circuit: "设备功能 03" },
    { id: "breaker-15-energy", deviceId: "energy-device-breaker-15", name: "正向有功电能", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼消防泵空开", deviceName: "众源智能空开 15", floorNode: "1号楼 → 公共区", circuit: "空开回路 15" },
    { id: "breaker-16-energy", deviceId: "energy-device-breaker-16", name: "正向有功电能", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼大堂照明空开", deviceName: "众源智能空开 16", floorNode: "1号楼 → 一楼 → 大堂", circuit: "空开回路 16" },
    { id: "breaker-17-energy", deviceId: "energy-device-breaker-17", name: "正向有功电能", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼茶水间空开", deviceName: "众源智能空开 17", floorNode: "2号楼 → 二楼", circuit: "空开回路 17" },
    { id: "breaker-18-energy", deviceId: "energy-device-breaker-18", name: "正向有功电能", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼排风机空开", deviceName: "众源智能空开 18", floorNode: "2号楼 → 公共区", circuit: "空开回路 18" },
    { id: "breaker-19-energy", deviceId: "energy-device-breaker-19", name: "正向有功电能", functionType: "电能", page: "园区能源管理", deviceRemark: "园区喷泉空开", deviceName: "众源智能空开 19", floorNode: "园区 → 室外", circuit: "空开回路 19" },
  ];

  const energyStatistics = [
    { id: "energy-001", deviceId: "energy-device-meter-04", functionId: "meter-04-function-01", name: "1号楼低区照明", deviceRemark: "A区总配电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "AMC96L-E4/KC", productName: "安科瑞三相电能表", sourceType: "安科瑞电表", sourceDevice: "安科瑞多回路电表 01", circuit: "设备功能 01", mode: "分相", phase: "—", functionName: "X7-卡布灯箱", functionType: "开关", navigationArea: "1号楼 / 201 设备间", statisticsArea: "1号楼 / 一楼", usageType: "照明", currentAmpere: 12.6, voltage: 220.4, cumulativeEnergy: 1248.3, periodEnergy: 1248.3, classificationStatus: "部分分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-29 09:20" },
    { id: "energy-003", deviceId: "energy-device-meter-04", functionId: "meter-04-function-03", name: "1号楼公共空调", deviceRemark: "A区总配电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "AMC96L-E4/KC", productName: "安科瑞三相电能表", sourceType: "安科瑞电表", sourceDevice: "安科瑞多回路电表 01", circuit: "设备功能 03", mode: "分相", phase: "—", functionName: "X2-卡布灯箱", functionType: "开关", navigationArea: "1号楼 / 201 设备间", statisticsArea: "1号楼 / 公共区", usageType: "空调", currentAmpere: 7.4, voltage: 221.1, cumulativeEnergy: 744.5, periodEnergy: 744.5, classificationStatus: "部分分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-29 09:20" },
    { id: "energy-004", deviceId: "energy-device-meter-06", functionId: null, name: "2号楼公共动力总表", deviceRemark: "B区动力电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "DTSD1352", productName: "安科瑞多功能电表", sourceType: "安科瑞电表", sourceDevice: "安科瑞三相电表 02", circuit: "全部设备功能", mode: "整表", phase: "—", functionName: "全部设备功能", functionType: "3 个功能点", navigationArea: "2号楼 / 201 设备间", statisticsArea: "2号楼 / 公共区", usageType: "动力", currentAmpere: 32.4, voltage: 380.6, cumulativeEnergy: 2216.8, periodEnergy: 2216.8, classificationStatus: "已分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-28 16:40" },
    { id: "energy-005", deviceId: "energy-device-breaker-07", functionId: "breaker-07-energy", name: "1号楼电梯回路", deviceRemark: "1号楼电梯空开", deviceType: "空开", protocol: "MQTT", deviceModel: "ZY-AFDD-63", productName: "众源智能空开", sourceType: "众源空开", sourceDevice: "众源网关 A / 智能空开 05", circuit: "空开回路 05", mode: "回路", phase: "—", functionName: "正向有功电能", functionType: "电能", navigationArea: "1号楼 / 201 设备间", statisticsArea: "1号楼 / 电梯", usageType: "电梯", currentAmpere: 5.6, voltage: 220.0, cumulativeEnergy: 612.4, periodEnergy: 612.4, classificationStatus: "已分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-27 11:08" },
    { id: "energy-006", deviceId: "energy-device-breaker-09", functionId: "breaker-09-energy", name: "2号楼会议室空调", deviceRemark: "2号楼空调空开", protocol: "MQTT", deviceType: "空开", deviceModel: "ZY-MCB-100", productName: "众源智能空开", sourceType: "众源空开", sourceDevice: "众源网关 B / 智能空开 12", circuit: "空开回路 12", mode: "回路", phase: "—", functionName: "正向有功电能", functionType: "电能", navigationArea: "2号楼 / 201 设备间", statisticsArea: "2号楼 / 二楼 / 202培训室", usageType: "空调", currentAmpere: null, voltage: null, cumulativeEnergy: null, periodEnergy: null, classificationStatus: "已分类", dataStatus: "数据中断", enabled: true, effectiveAt: "2026-10-26 14:35" },
    { id: "energy-007", deviceId: "energy-device-meter-03", functionId: null, name: "1号楼备用回路", deviceRemark: "1号楼备用电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "AMC96L-E4/KC", productName: "安科瑞三相电能表", sourceType: "安科瑞电表", sourceDevice: "安科瑞多回路电表 03", circuit: "全部设备功能", mode: "整表", phase: "—", functionName: "全部设备功能", functionType: "3 个功能点", navigationArea: "1号楼 / 公共区", statisticsArea: "1号楼 / 公共区", usageType: "其他", currentAmpere: null, voltage: null, cumulativeEnergy: null, classificationStatus: "未分类", dataStatus: "正常", enabled: false, effectiveAt: "—" },
    { id: "energy-008", deviceId: "energy-device-breaker-03", functionId: "breaker-03-energy", name: "室外景观回路", deviceRemark: "室外景观空开", deviceType: "空开", protocol: "MQTT", deviceModel: "ZY-AFDD-63", productName: "众源智能空开", sourceType: "众源空开", sourceDevice: "众源网关 C / 智能空开 03", circuit: "空开回路 03", mode: "回路", phase: "—", functionName: "正向有功电能", functionType: "电能", navigationArea: "园区 / 室外", statisticsArea: "园区 / 室外", usageType: "照明", currentAmpere: null, voltage: null, cumulativeEnergy: null, classificationStatus: "已分类", dataStatus: "来源失效", enabled: false, effectiveAt: "2026-10-24 10:02" },
  ];

  const energyClassificationHistory = [
    { id: "energy-history-breaker-03-001", sourceKey: "energy-device-breaker-03", deviceRemark: "室外景观空开", sourceDevice: "众源网关 C / 智能空开 03", deviceModel: "ZY-AFDD-63", mode: "回路", functionName: "正向有功电能", functionType: "电能", statisticsArea: "园区", usageType: "其他", effectiveFrom: "2026-01-01 00:00", effectiveTo: "2026-03-01 00:00", periodEnergy: 45.6, change: "首次接入并归入园区" },
    { id: "energy-history-breaker-03-002", sourceKey: "energy-device-breaker-03", deviceRemark: "室外景观空开", sourceDevice: "众源网关 C / 智能空开 03", deviceModel: "ZY-AFDD-63", mode: "回路", functionName: "正向有功电能", functionType: "电能", statisticsArea: "园区", usageType: "照明", effectiveFrom: "2026-03-01 00:00", effectiveTo: "2026-05-01 08:30", periodEnergy: 62.8, change: "用电类型调整为照明" },
    { id: "energy-history-breaker-03-003", sourceKey: "energy-device-breaker-03", deviceRemark: "室外景观空开", sourceDevice: "众源网关 C / 智能空开 03", deviceModel: "ZY-AFDD-63", mode: "回路", functionName: "正向有功电能", functionType: "电能", statisticsArea: "园区 / 室外", usageType: "照明", effectiveFrom: "2026-05-01 08:30", effectiveTo: "2026-07-01 09:00", periodEnergy: 84.3, change: "统计区域细化至室外" },
    { id: "energy-history-breaker-03-004", sourceKey: "energy-device-breaker-03", deviceRemark: "室外景观空开", sourceDevice: "众源网关 C / 智能空开 03", deviceModel: "ZY-AFDD-63", mode: "回路", functionName: "正向有功电能", functionType: "电能", statisticsArea: "园区 / 室外", usageType: "照明", effectiveFrom: "2026-07-01 09:00", effectiveTo: "2026-08-15 18:00", periodEnergy: 78.9, change: "景观照明回路检修后重新生效" },
    { id: "energy-history-breaker-03-005", sourceKey: "energy-device-breaker-03", deviceRemark: "室外景观空开", sourceDevice: "众源网关 C / 智能空开 03", deviceModel: "ZY-AFDD-63", mode: "回路", functionName: "正向有功电能", functionType: "电能", statisticsArea: "园区 / 室外", usageType: "其他", effectiveFrom: "2026-08-15 18:00", effectiveTo: "2026-09-20 13:30", periodEnergy: 91.5, change: "临时调整用电类型为其他" },
    { id: "energy-history-breaker-03-006", sourceKey: "energy-device-breaker-03", deviceRemark: "室外景观空开", sourceDevice: "众源网关 C / 智能空开 03", deviceModel: "ZY-AFDD-63", mode: "回路", functionName: "正向有功电能", functionType: "电能", statisticsArea: "园区 / 室外", usageType: "照明", effectiveFrom: "2026-09-20 13:30", effectiveTo: "2026-10-24 10:02", periodEnergy: 105.7, change: "用电类型恢复为照明" },
    { id: "energy-history-seed-001", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "整表", functionName: "全部设备功能", functionType: "3 个功能点", statisticsArea: "1号楼", usageType: "其他", effectiveFrom: "2026-01-01 00:00", effectiveTo: "2026-02-01 00:00", periodEnergy: 86.4, change: "首次接入并按整表分类" },
    { id: "energy-history-seed-002", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "整表", functionName: "全部设备功能", functionType: "3 个功能点", statisticsArea: "1号楼 / 公共区", usageType: "其他", effectiveFrom: "2026-02-01 00:00", effectiveTo: "2026-03-01 00:00", periodEnergy: 94.8, change: "统计区域调整至公共区" },
    { id: "energy-history-seed-003", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "整表", functionName: "全部设备功能", functionType: "3 个功能点", statisticsArea: "1号楼 / 公共区", usageType: "动力", effectiveFrom: "2026-03-01 00:00", effectiveTo: "2026-04-01 08:30", periodEnergy: 107.2, change: "用电类型由其他改为动力" },
    { id: "energy-history-seed-004", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、插座、空调", effectiveFrom: "2026-04-01 08:30", effectiveTo: "2026-05-12 10:15", periodEnergy: 188.0, change: "整表改为分相，建立三个功能点归属" },
    { id: "energy-history-seed-005", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、插座、空调", effectiveFrom: "2026-05-12 10:15", effectiveTo: "2026-06-05 14:20", periodEnergy: 201.7, change: "X7 统计区域细化至大堂" },
    { id: "energy-history-seed-006", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、插座、空调", effectiveFrom: "2026-06-05 14:20", effectiveTo: "2026-07-01 09:00", periodEnergy: 215.6, change: "X5 由二楼调整至三楼" },
    { id: "energy-history-seed-007", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、插座、动力", effectiveFrom: "2026-07-01 09:00", effectiveTo: "2026-07-18 16:40", periodEnergy: 224.3, change: "X2 用电类型由空调改为动力" },
    { id: "energy-history-seed-008", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、插座、动力", effectiveFrom: "2026-07-18 16:40", effectiveTo: "2026-08-03 11:05", periodEnergy: 236.8, change: "X7 统计区域恢复至一楼" },
    { id: "energy-history-seed-009", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、其他、动力", effectiveFrom: "2026-08-03 11:05", effectiveTo: "2026-08-15 18:00", periodEnergy: 248.1, change: "X5 用电类型临时改为其他" },
    { id: "energy-history-seed-010", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、其他、空调", effectiveFrom: "2026-08-15 18:00", effectiveTo: "2026-09-01 00:00", periodEnergy: 263.4, change: "X2 用电类型恢复为空调" },
    { id: "energy-history-seed-011", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "整表", functionName: "全部设备功能", functionType: "3 个功能点", statisticsArea: "1号楼 / 公共区", usageType: "动力", effectiveFrom: "2026-09-01 00:00", effectiveTo: "2026-09-20 13:30", periodEnergy: 96.5, change: "三个分相临时合并为整表" },
    { id: "energy-history-seed-012", sourceKey: "energy-device-meter-04", deviceRemark: "A区总配电表", sourceDevice: "安科瑞多回路电表 01", deviceModel: "AMC96L-E4/KC", mode: "分相", functionName: "3 个功能点", functionType: "设备功能汇总", statisticsArea: "多区域（3 项）", usageType: "照明、插座、空调", effectiveFrom: "2026-09-20 13:30", effectiveTo: "2026-10-29 09:20", periodEnergy: 446.3, change: "整表重新拆分为三个功能点" },
  ];

  const energyDetailAnalytics = {
    default: {
      summary: { monthEnergy: 96.8, dailyAverage: 3.23 },
      series: {
        "7d": [{ label: "10/24", value: 2.8 }, { label: "10/25", value: 3.6 }, { label: "10/26", value: 3.2 }, { label: "10/27", value: 4.1 }, { label: "10/28", value: 3.7 }, { label: "10/29", value: 4.5 }, { label: "10/30", value: 4.0 }],
        "30d": [{ label: "10/01", value: 2.6 }, { label: "10/04", value: 3.1 }, { label: "10/07", value: 2.9 }, { label: "10/10", value: 3.8 }, { label: "10/13", value: 3.5 }, { label: "10/16", value: 4.0 }, { label: "10/19", value: 3.7 }, { label: "10/22", value: 4.4 }, { label: "10/25", value: 3.9 }, { label: "10/28", value: 4.6 }, { label: "10/30", value: 4.0 }],
        "12m": [{ label: "11月", value: 72 }, { label: "12月", value: 78 }, { label: "1月", value: 86 }, { label: "2月", value: 95 }, { label: "3月", value: 107 }, { label: "4月", value: 116 }, { label: "5月", value: 122 }, { label: "6月", value: 128 }, { label: "7月", value: 134 }, { label: "8月", value: 143 }, { label: "9月", value: 151 }, { label: "10月", value: 168 }],
      },
    },
    "energy-device-meter-04": {
      summary: { monthEnergy: 168.4, dailyAverage: 5.61 },
      series: {
        "7d": [{ label: "10/24", value: 4.8 }, { label: "10/25", value: 5.4 }, { label: "10/26", value: 5.1 }, { label: "10/27", value: 6.3 }, { label: "10/28", value: 5.8 }, { label: "10/29", value: 7.0 }, { label: "10/30", value: 6.4 }],
        "30d": [{ label: "10/01", value: 4.2 }, { label: "10/04", value: 4.8 }, { label: "10/07", value: 4.5 }, { label: "10/10", value: 5.6 }, { label: "10/13", value: 5.1 }, { label: "10/16", value: 6.0 }, { label: "10/19", value: 5.7 }, { label: "10/22", value: 6.6 }, { label: "10/25", value: 5.9 }, { label: "10/28", value: 7.2 }, { label: "10/30", value: 6.4 }],
        "12m": [{ label: "11月", value: 82 }, { label: "12月", value: 90 }, { label: "1月", value: 86 }, { label: "2月", value: 95 }, { label: "3月", value: 107 }, { label: "4月", value: 116 }, { label: "5月", value: 122 }, { label: "6月", value: 128 }, { label: "7月", value: 134 }, { label: "8月", value: 143 }, { label: "9月", value: 151 }, { label: "10月", value: 168 }],
      },
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  global.GVP_DEMO_DATA = {
    create() {
      return {
        locations: clone(locations),
        components: clone(components),
        cabinets: clone(cabinets),
        devices: clone(devices),
        history: clone(history),
        energyRecords: clone(energyRecords),
        energyTypes: clone(energyTypes),
        energyAreas: clone(energyAreas),
        energyDevices: clone(energyDevices),
        energyDeviceFunctions: clone(energyDeviceFunctions),
        energyStatistics: clone(energyStatistics),
        energyClassificationHistory: clone(energyClassificationHistory),
        energyDetailAnalytics: clone(energyDetailAnalytics),
      };
    },
  };
})(window);
