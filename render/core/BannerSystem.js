/** 
 * BannerSystem - Manages race event banners with different visual styles
 */ 
export class BannerSystem {
  constructor() {
    this.activeBanners = new Map();
    this.bannerTypes = {
      STUMBLE: 'stumble',
      FINISH: 'finish', 
      INCIDENT: 'incident',
      NAME: 'name'
    };
  }

  createBanner(type, laneIndex, text, duration = null) {
    // Create different visual styles based on type
    // Handle banner lifecycle
    // Position banners behind ferrets
    if (this.activeBanners.has(laneIndex)) {
      const banner = this.activeBanners.get(laneIndex);
      banner.text = text;
      banner.type = type;
      banner.startTime = Date.now();
    } else {
      const banner = {
        laneIndex: laneIndex,
        text: text,
        type: type,
        startTime: Date.now(),
        duration: duration,
      };
      this.activeBanners.set(laneIndex, banner);
    }
  }

  render(ctx, camera, worldTransform, race, renderProps) {
    // Render all active banners in world-space (camera already applied via ctx)
    const dpr = (window.devicePixelRatio || 1);
    const w = ctx.canvas.width / dpr;
    const laneHeight = worldTransform.laneHeight;
    const totalHeight = laneHeight * (renderProps?.numberOfLanes || 10);
    const worldPixelWidth = w * 4;

    for (const [laneIndex, banner] of this.activeBanners.entries()) {
      const { type, text, startTime, duration } = banner;
      const rid = race?.racers?.[laneIndex];
      const locPct = race?.liveLocations?.[rid] ?? 0;

      const bannerWidth = 200;
      const bannerHeight = 30;
      const bannerX = (locPct / 100) * worldPixelWidth - (bannerWidth * 0.5); // center-ish near racer
      const laneTopY = laneIndex * laneHeight;
      const bannerY = laneTopY + (laneHeight * 0.15); // stay within lane

      const bannerColor = this.getBannerColor(type);
      const textColor = this.getBannerTextColor(type);
      const isFinished = typeof duration === 'number' && (Date.now() - startTime > duration * 1000);

      ctx.save();
      ctx.fillStyle = bannerColor;
      ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);
      ctx.fillStyle = textColor;
      ctx.font = '18px Orbitron';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(text, bannerX + 10, bannerY + 5);
      ctx.restore();

      if (isFinished) {
        this.activeBanners.delete(laneIndex);
      }
    }
  }

  getBannerColor(type) {
    switch (type) {
      case this.bannerTypes.STUMBLE:
        return 'rgba(255, 0, 0, 0.8)';
      case this.bannerTypes.FINISH:
        return 'rgba(0, 255, 0, 0.8)';
      case this.bannerTypes.INCIDENT:
        return 'rgba(0, 0, 255, 0.8)';
      case this.bannerTypes.NAME:
        return 'rgba(255, 255, 255, 0.8)';
      default:
        return 'rgba(255, 255, 255, 0.8)';
    }
  }

  getBannerTextColor(type) {
    switch (type) {
      case this.bannerTypes.STUMBLE:
        return 'white';
      case this.bannerTypes.FINISH:
        return 'black';
      case this.bannerTypes.INCIDENT:
        return 'white';
      case this.bannerTypes.NAME:
        return 'black';
      default:
        return 'black';
    }
  }
}