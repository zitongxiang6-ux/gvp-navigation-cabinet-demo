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
    { id: "energy-device-meter-04", remark: "A区总配电表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "AMC96L-E4/KC", product: "安科瑞三相电能表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 04", navigationArea: "1号楼 / 201 设备间" },
    { id: "energy-device-meter-06", remark: "B区动力电表", deviceType: "电表", status: "online", protocol: "Modbus TCP", model: "DTSD1352", product: "安科瑞多功能电表", sourceType: "安科瑞电表", deviceName: "安科瑞三相电表 06", navigationArea: "2号楼 / 201 设备间" },
    { id: "energy-device-breaker-07", remark: "1号楼电梯空开", deviceType: "空开", status: "online", protocol: "MQTT", model: "ZY-AFDD-63", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 A / 智能空开 07", navigationArea: "1号楼 / 201 设备间" },
    { id: "energy-device-breaker-09", remark: "2号楼空调空开", deviceType: "空开", status: "offline", protocol: "MQTT", model: "ZY-MCB-100", product: "众源智能空开", sourceType: "众源空开", deviceName: "众源网关 B / 智能空开 09", navigationArea: "2号楼 / 201 设备间" },
  ];

  const energyDeviceFunctions = [
    { id: "meter-04-function-01", deviceId: "energy-device-meter-04", name: "X7-卡布灯箱", functionType: "开关", page: "1号楼能源管理", deviceRemark: "A区总配电表", deviceName: "安科瑞三相电表 04", floorNode: "1号楼 → 201 设备间", circuit: "设备功能 01" },
    { id: "meter-04-function-02", deviceId: "energy-device-meter-04", name: "X5-卡布灯箱", functionType: "开关", page: "1号楼能源管理", deviceRemark: "A区总配电表", deviceName: "安科瑞三相电表 04", floorNode: "1号楼 → 201 设备间", circuit: "设备功能 02" },
    { id: "meter-04-function-03", deviceId: "energy-device-meter-04", name: "X2-卡布灯箱", functionType: "开关", page: "1号楼能源管理", deviceRemark: "A区总配电表", deviceName: "安科瑞三相电表 04", floorNode: "1号楼 → 201 设备间", circuit: "设备功能 03" },
    { id: "meter-06-function-01", deviceId: "energy-device-meter-06", name: "一层公共照明", functionType: "电能", page: "2号楼能源管理", deviceRemark: "B区动力电表", deviceName: "安科瑞三相电表 06", floorNode: "2号楼 → 201 设备间", circuit: "设备功能 01" },
    { id: "meter-06-function-02", deviceId: "energy-device-meter-06", name: "二层办公插座", functionType: "电能", page: "2号楼能源管理", deviceRemark: "B区动力电表", deviceName: "安科瑞三相电表 06", floorNode: "2号楼 → 201 设备间", circuit: "设备功能 02" },
    { id: "meter-06-function-03", deviceId: "energy-device-meter-06", name: "公共区域空调", functionType: "电能", page: "2号楼能源管理", deviceRemark: "B区动力电表", deviceName: "安科瑞三相电表 06", floorNode: "2号楼 → 201 设备间", circuit: "设备功能 03" },
    { id: "breaker-07-energy", deviceId: "energy-device-breaker-07", name: "正向有功电能", functionType: "电能", page: "1号楼能源管理", deviceRemark: "1号楼电梯空开", deviceName: "众源智能空开 07", floorNode: "1号楼 → 201 设备间", circuit: "空开回路 07" },
    { id: "breaker-09-energy", deviceId: "energy-device-breaker-09", name: "正向有功电能", functionType: "电能", page: "2号楼能源管理", deviceRemark: "2号楼空调空开", deviceName: "众源智能空开 09", floorNode: "2号楼 → 201 设备间", circuit: "空开回路 09" },
  ];

  const energyStatistics = [
    { id: "energy-001", name: "1号楼低区照明", deviceRemark: "A区总配电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "AMC96L-E4/KC", productName: "安科瑞三相电能表", sourceType: "安科瑞电表", sourceDevice: "安科瑞多回路电表 01", circuit: "设备功能 01", mode: "分相", phase: "—", functionName: "X7-卡布灯箱", functionType: "开关", navigationArea: "1号楼 / 201 设备间", statisticsArea: "1号楼 / 一楼", usageType: "照明", currentAmpere: 12.6, voltage: 220.4, cumulativeEnergy: 1248.3, classificationStatus: "已分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-29 09:20" },
    { id: "energy-002", name: "1号楼办公插座", deviceRemark: "A区总配电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "AMC96L-E4/KC", productName: "安科瑞三相电能表", sourceType: "安科瑞电表", sourceDevice: "安科瑞多回路电表 01", circuit: "设备功能 02", mode: "分相", phase: "—", functionName: "X5-卡布灯箱", functionType: "开关", navigationArea: "1号楼 / 201 设备间", statisticsArea: "1号楼 / 三楼", usageType: "插座", currentAmpere: 9.8, voltage: 219.8, cumulativeEnergy: 986.2, classificationStatus: "已分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-29 09:20" },
    { id: "energy-003", name: "1号楼公共空调", deviceRemark: "A区总配电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "AMC96L-E4/KC", productName: "安科瑞三相电能表", sourceType: "安科瑞电表", sourceDevice: "安科瑞多回路电表 01", circuit: "设备功能 03", mode: "分相", phase: "—", functionName: "X2-卡布灯箱", functionType: "开关", navigationArea: "1号楼 / 201 设备间", statisticsArea: "1号楼 / 公共区", usageType: "空调", currentAmpere: 7.4, voltage: 221.1, cumulativeEnergy: 744.5, classificationStatus: "部分分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-29 09:20" },
    { id: "energy-004", name: "2号楼公共动力总表", deviceRemark: "B区动力电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "DTSD1352", productName: "安科瑞多功能电表", sourceType: "安科瑞电表", sourceDevice: "安科瑞三相电表 02", circuit: "全部设备功能", mode: "整表", phase: "—", functionName: "全部设备功能", functionType: "3 个功能点", navigationArea: "2号楼 / 201 设备间", statisticsArea: "2号楼 / 公共区", usageType: "动力", currentAmpere: 32.4, voltage: 380.6, cumulativeEnergy: 2216.8, classificationStatus: "已分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-28 16:40" },
    { id: "energy-005", name: "1号楼电梯回路", deviceRemark: "1号楼电梯空开", deviceType: "空开", protocol: "MQTT", deviceModel: "ZY-AFDD-63", productName: "众源智能空开", sourceType: "众源空开", sourceDevice: "众源网关 A / 智能空开 05", circuit: "空开回路 05", mode: "回路", phase: "—", functionName: "正向有功电能", functionType: "电能", navigationArea: "1号楼 / 201 设备间", statisticsArea: "1号楼 / 电梯", usageType: "电梯", currentAmpere: 5.6, voltage: 220.0, cumulativeEnergy: 612.4, classificationStatus: "已分类", dataStatus: "正常", enabled: true, effectiveAt: "2026-10-27 11:08" },
    { id: "energy-006", name: "2号楼会议室空调", deviceRemark: "2号楼空调空开", deviceType: "空开", protocol: "MQTT", deviceModel: "ZY-MCB-100", productName: "众源智能空开", sourceType: "众源空开", sourceDevice: "众源网关 B / 智能空开 12", circuit: "空开回路 12", mode: "回路", phase: "—", functionName: "正向有功电能", functionType: "电能", navigationArea: "2号楼 / 201 设备间", statisticsArea: "2号楼 / 二楼 / 202培训室", usageType: "空调", currentAmpere: null, voltage: null, cumulativeEnergy: null, classificationStatus: "已分类", dataStatus: "数据中断", enabled: true, effectiveAt: "2026-10-26 14:35" },
    { id: "energy-007", name: "1号楼备用回路", deviceRemark: "1号楼备用电表", deviceType: "电表", protocol: "Modbus TCP", deviceModel: "AMC96L-E4/KC", productName: "安科瑞三相电能表", sourceType: "安科瑞电表", sourceDevice: "安科瑞多回路电表 03", circuit: "全部设备功能", mode: "整表", phase: "—", functionName: "全部设备功能", functionType: "3 个功能点", navigationArea: "1号楼 / 201 设备间", statisticsArea: "—", usageType: "—", currentAmpere: null, voltage: null, cumulativeEnergy: null, classificationStatus: "未分类", dataStatus: "正常", enabled: false, effectiveAt: "—" },
    { id: "energy-008", name: "室外景观回路", deviceRemark: "室外景观空开", deviceType: "空开", protocol: "MQTT", deviceModel: "ZY-AFDD-63", productName: "众源智能空开", sourceType: "众源空开", sourceDevice: "众源网关 C / 智能空开 03", circuit: "空开回路 03", mode: "回路", phase: "—", functionName: "正向有功电能", functionType: "电能", navigationArea: "园区 / 室外", statisticsArea: "园区 / 室外", usageType: "照明", currentAmpere: null, voltage: null, cumulativeEnergy: null, classificationStatus: "已分类", dataStatus: "来源失效", enabled: false, effectiveAt: "2026-10-24 10:02" },
  ];

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
      };
    },
  };
})(window);
