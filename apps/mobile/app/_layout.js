"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RootLayout;
const expo_router_1 = require("expo-router");
const expo_status_bar_1 = require("expo-status-bar");
function RootLayout() {
    return (<>
      <expo_router_1.Stack>
        <expo_router_1.Stack.Screen name="index" options={{ title: 'Beauty Manager' }}/>
      </expo_router_1.Stack>
      <expo_status_bar_1.StatusBar style="auto"/>
    </>);
}
//# sourceMappingURL=_layout.js.map