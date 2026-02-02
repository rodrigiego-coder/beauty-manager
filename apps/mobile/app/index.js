"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomeScreen;
const react_native_1 = require("react-native");
function HomeScreen() {
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>Beauty Manager</react_native_1.Text>
      <react_native_1.Text style={styles.subtitle}>Sistema de Gestao de Salao de Beleza</react_native_1.Text>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fdf2f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#be185d',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
    },
});
//# sourceMappingURL=index.js.map