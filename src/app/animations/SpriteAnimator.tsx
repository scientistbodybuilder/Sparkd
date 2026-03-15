import React, { useState, useEffect, forwardRef, useImperativeHandle  } from 'react'
type SpriteAnimatorProps = {
    end: () => void;
    fps: number;
    displayWidth?: number;
    displayHeight?: number;
    src?: string;
    frameHeight?: number;
    frameWidth?: number;
    frameCount?: number;
}

export type SpriteAnimatorHandle = {
    updateAnimation: (animation: string) => void
}

type Animation = {
  src: string;
  frameCount: number;
};

type Animations = {
    [key: string]: Animation;
};

const SpriteAnimator = forwardRef<SpriteAnimatorHandle, SpriteAnimatorProps>((props, ref) => {
  const animations: Animations = {
    idle: {
      src: "/animations/enemy_idle_sheet.png",
      frameCount: 18,
    },
    hurt: {
      src: "/animations/enemy_hurt_sheet.png",
      frameCount: 12
    },
    dying: {
      src: "/animations/enemy_dying_sheet.png",
      frameCount: 12
    },
    dead: {
      src: "/animations/enemy_dead_sheet.png",
      frameCount: 1
    },
    attack: {
      src: "/animations/enemy_attack_sheet.png",
      frameCount: 12
    }
  }
  const [frame, setFrame] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState('idle')
  const [spriteDim, setSpriteDim] = useState(500)
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
  // console.log('the current animation is: ',currentAnimation)
  // console.log('sheet: ',animations[currentAnimation])

  // useEffect(() => {
  //   setCurrentAnimation(animation)
  // }, [animation])
  const updateAnimation = (ani: any) => {
    console.log('update animation called')
    setCurrentAnimation(ani)
    setFrame(0)
  }

  useImperativeHandle(ref, () => ({
    updateAnimation,
  }));

  useEffect(() => {
        const handleResize = () => {
        setSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (size.width >= 1290) {
            setSpriteDim(500)
        } else if (size.width >= 768) {
            setSpriteDim(420)
        } else {
            setSpriteDim(360)
        }
    },[size])


  useEffect(() => {
    const interval = setInterval(() => {
      // setFrame((prev) => (prev + 1) % frameCount);
      setFrame((prev) => {
      const next = (prev + 1) % animations[currentAnimation].frameCount;
      
      if (currentAnimation === "hurt" && prev === animations[currentAnimation].frameCount - 1) {
        // Finished hurt animation
        setCurrentAnimation("idle");
        return 0; // reset frame
      }
      else if (currentAnimation === "attack" && prev === animations[currentAnimation].frameCount - 1) {
        setCurrentAnimation("idle")
        return 0
      }
      else if (currentAnimation == "dying" && prev === animations[currentAnimation].frameCount - 1) {
        setCurrentAnimation("dead")
        return 0;
      } else if (currentAnimation == "dead" && prev === animations[currentAnimation].frameCount - 1) {
        props.end()
      }
      
      return next;
    });
    }, 1000 / props.fps);
    
    return () => clearInterval(interval);
  }, [props.fps, currentAnimation]);

  return (
    <div
      style={{
        width: spriteDim,
        height: spriteDim,
        backgroundImage: `url(${animations[currentAnimation].src})`,
        backgroundPosition: `-${frame * spriteDim}px 0px`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${animations[currentAnimation].frameCount * spriteDim}px ${1 * spriteDim}px`,
      }}
    />
  );
});

export default SpriteAnimator

// { 
//   src, 
//   frameWidth = 900, 
//   frameHeight = 900, 
//   frameCount, 
//   fps, 
//   displayWidth = frameWidth, 
//   displayHeight = frameHeight,
//   animation 
// }