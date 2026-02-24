const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/features/landing/crypto-bubble.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace svgRef with canvasRef
content = content.replace(
    'const svgRef = useRef<SVGSVGElement | null>(null);',
    'const canvasRef = useRef<HTMLCanvasElement | null>(null);\n    const hoveredNodeRef = useRef<CryptoCoin | null>(null);'
);

// 2. Replace the <svg> element with <canvas>
content = content.replace(
    /<svg\s+ref=\{svgRef\}[\s\S]*?<\/svg>/,
    `<canvas
                            ref={canvasRef}
                            className="absolute inset-0"
                            style={{
                                width: \`\${dimensions.width}px\`,
                                height: \`\${dimensions.height}px\`,
                                background: \`
                                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.12) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.12) 0%, transparent 50%),
                                    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.08) 0%, transparent 50%)
                                \`
                            }}
                        />`
);

const startStr = '    // D3 Rendering with CryptoBubbles-style animations and physics\n    useEffect(() => {';
const endStr = '    }, [marketData, dimensions, loading, error, selectedCategory, timeframe, sizeBy, scaleMode]);';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find useEffect block");
    process.exit(1);
}

const newUseEffect = fs.readFileSync(path.join(__dirname, 'new-useeffect.txt'), 'utf8');

content = content.substring(0, startIndex) + newUseEffect + content.substring(endIndex);
fs.writeFileSync(filePath, content);
console.log("Replaced useEffect block");
