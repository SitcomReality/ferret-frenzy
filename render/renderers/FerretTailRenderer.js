import { VerletChain } from "../../render/systems/VerletChain.js";

/**
 * FerretTailRenderer - Renders ferret tail with physics-based animation
 */
export class FerretTailRenderer {
  constructor() {
    // Tail rendering state managed per ferret instance
  }

  render(ctx, ferret, colors) {
    // New: Tail follows the particle chain if enabled
    if (ferret.bodyChain?.enabled && ferret.bodyChain.nodes.length >= 2) {
      this.renderChainedTail(ctx, ferret, colors);
      return;
    }

    // Create particle chain for tail if it doesn't exist
    if (!ferret.tailChain) {
      this.createTailChain(ferret);
    }

    // Update and render particle tail
    this.updateTailChain(ferret);
    this.renderParticleTail(ctx, ferret, colors);
  }

  createTailChain(ferret) {
    const tailLength = ferret.tail.length * 25;
    const nodeCount = Math.max(4, Math.floor(tailLength / 6)); // More nodes for flexibility
    const restDistance = tailLength / (nodeCount - 1);
    
    // Create chain with very low stiffness for floppy movement
    const chain = VerletChain.createChain({
      count: nodeCount,
      start: { x: 0, y: 0 },
      dir: { x: -1, y: 0 }, // Pointing backward
      spacing: restDistance
    });

    ferret.tailChain = {
      nodes: chain.nodes,
      prevNodes: chain.prevNodes,
      restLengths: chain.restLengths,
      params: {
        stiffness: 0.12, // Very low stiffness for floppy movement
        damping: 0.78,  // Reduced damping for more wobble
        iterations: 1,  // Fewer iterations for softer constraints
        thicknessStart: 5 * ferret.tail.fluffiness,
        thicknessEnd: 2 * ferret.tail.fluffiness
      },
      anchors: {
        base: { x: 0, y: 0, weight: 0.8 } // Strong attachment to body
      }
    };
  }

  updateTailChain(ferret) {
    if (!ferret.tailChain) return;

    const chain = ferret.tailChain;
    const dt = 0.016; // Assume 60fps

    // Apply gentle sway based on gait
    const swayAmount = Math.sin(ferret.gait.cyclePhase * 0.8 + ferret.seed % 1000 * 0.1) * 2;
    
    // Add some random wobble
    const wobbleX = (Math.random() - 0.5) * 1.5;
    const wobbleY = (Math.random() - 0.5) * 1.0;

    // Apply forces to nodes (except the base)
    for (let i = 1; i < chain.nodes.length; i++) {
      const node = chain.nodes[i];
      
      // Apply gentle sway and wobble
      node.x += wobbleX * (i / chain.nodes.length);
      node.y += wobbleY * (i / chain.nodes.length) + swayAmount * 0.5;
      
      // Add slight downward force (gravity)
      node.y += 0.3;
    }

    // Update physics
    VerletChain.integrate(chain.nodes, chain.prevNodes, dt, chain.params.damping);
    VerletChain.satisfyConstraints(chain.nodes, chain.restLengths, chain.params.iterations, chain.params.stiffness);
    VerletChain.smoothCurvature(chain.nodes, 0.15); // More curvature smoothing
  }

  renderParticleTail(ctx, ferret, colors) {
    if (!ferret.tailChain || ferret.tailChain.nodes.length < 2) return;

    const chain = ferret.tailChain;
    const nodes = chain.nodes;
    const params = chain.params;

    // Sample points along the chain for smooth rendering
    const segments = 16;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const index = t * (nodes.length - 1);
      const idx = Math.floor(index);
      const frac = index - idx;
      
      if (idx >= nodes.length - 1) {
        points.push({ ...nodes[nodes.length - 1] });
      } else {
        const p0 = nodes[idx];
        const p1 = nodes[idx + 1];
        points.push({
          x: p0.x + (p1.x - p0.x) * frac,
          y: p0.y + (p1.y - p0.y) * frac
        });
      }
    }

    // Draw the tail as a thick, flexible spline
    const startWidth = params.thicknessStart;
    const endWidth = params.thicknessEnd;
    
    // Create a smooth curve through the points
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    // Use quadratic curves for smooth segments
    for (let i = 1; i < points.length - 1; i += 2) {
      if (i + 1 < points.length) {
        const cp = points[i];
        const end = points[i + 1];
        ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
      }
    }

    // Add the final segment
    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    }

    // Set up gradient width along the tail
    const gradient = ctx.createLinearGradient(points[0].x, points[0].y, 
                                               points[points.length - 1].x, points[points.length - 1].y);
    gradient.addColorStop(0, colors[2]);
    gradient.addColorStop(0.7, colors[2]);
    gradient.addColorStop(1, this.shadeColor(colors[2], -20));

    // Draw the tail with variable width
    for (let i = 0; i < points.length - 1; i++) {
      const t = i / (points.length - 1);
      const width = startWidth * (1 - t) + endWidth * t;
      const currentWidth = Math.max(1, width);

      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      if (i + 1 < points.length) {
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
      }
      
      ctx.lineWidth = currentWidth;
      ctx.strokeStyle = gradient;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Add subtle shadow for depth
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = Math.max(1, startWidth * 0.3);
    
    // Draw shadow slightly offset
    ctx.beginPath();
    ctx.moveTo(points[0].x + 1, points[0].y + 2);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x + 1, points[i].y + 2);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  renderChainedTail(ctx, ferret, colors) {
    const chain = ferret.bodyChain;
    if (!chain || chain.nodes.length < 2) return;

    // The attachment point is the last node (N_end = hip)
    const N = chain.nodes.length;
    const baseNode = chain.nodes[N - 1]; 
    const prevNode = chain.nodes[N - 2]; 

    // 1. Calculate the direction vector of the last segment (N_{end-1} -> N_end)
    const dirX = baseNode.x - prevNode.x;
    const dirY = baseNode.y - prevNode.y;
    const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
    
    let normDirX = dirX;
    let normDirY = dirY;
    if (dirLength > 0.01) {
      normDirX /= dirLength;
      normDirY /= dirLength;
    } else {
        // Fallback direction: straight back (left in local space)
        normDirX = -1;
        normDirY = 0;
    }
    
    // 2. Calculate sway and tip position
    
    // Approximate ground level in local coordinates (used in FerretLegRenderer as well)
    const targetGroundY = baseNode.y + 4; // slight downforce relative to body
    
    const tailLength = ferret.tail.length * 25; 
    const tailSwayFactor = Math.sin(ferret.gait.cyclePhase * 1.3 + ferret.seed % 1000 * 0.1) * 1.0; // freer oscillation
    
    // P0: Tail base, anchored at the last body node
    const P0 = { x: baseNode.x, y: baseNode.y }; 
    
    // Calculate P1 (Tip) target: extend backward (in direction of normDir)
    const tipX = P0.x + normDirX * tailLength * 0.8; 
    // Calculate P1 (Tip) target Y: blend towards ground level (targetGroundY)
    const tipY = P0.y * 0.85 + targetGroundY * 0.15 + Math.sin(ferret.gait.cyclePhase * 1.1) * 3;
    
    // Control Point PC: Halfway, influenced by direction, slightly bent downwards, and sway
    const swayX = tailSwayFactor * 1.5;
    const PC = { 
        x: P0.x + normDirX * tailLength * 0.3 + swayX, 
        y: P0.y + normDirY * tailLength * 0.15 + (tipY - P0.y) * 0.2 
    };

    const P1 = { x: tipX, y: tipY }; 

    // Calculate tail width based on fluffiness
    const baseWidth = 4 * ferret.tail.fluffiness;
    const currentWidth = baseWidth * 0.85;

    // Render tail curve with more natural wobble
    const wobbleX = Math.sin(ferret.gait.cyclePhase * 0.7) * 2;
    const wobbleY = Math.cos(ferret.gait.cyclePhase * 0.5) * 1.5;

    ctx.beginPath();
    ctx.moveTo(P0.x, P0.y);
    // Use quadratic curve from base (P0) through control (PC) to tip (P1)
    ctx.quadraticCurveTo(PC.x + wobbleX, PC.y + wobbleY, P1.x + wobbleX * 0.5, P1.y + wobbleY * 0.5);
    ctx.lineWidth = currentWidth;
    ctx.strokeStyle = colors[2];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Add subtle ground contact shadow
    if (!ferret.isStumbling) {
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      // Offset points for shadow
      const shadowOffset = 2; 
      const shadowP0 = { x: P0.x + 1, y: P0.y + shadowOffset };
      const shadowPC = { x: PC.x + 1 + wobbleX * 0.5, y: PC.y + shadowOffset + wobbleY * 0.5 };
      const shadowP1 = { x: P1.x + 1 + wobbleX * 0.3, y: P1.y + shadowOffset + wobbleY * 0.3 };

      ctx.moveTo(shadowP0.x, shadowP0.y);
      ctx.quadraticCurveTo(shadowPC.x, shadowPC.y, shadowP1.x, shadowP1.y);

      ctx.lineWidth = currentWidth * 0.6;
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    const RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
  }
}