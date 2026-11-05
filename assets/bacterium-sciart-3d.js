
  // Brilho reforçado da bactéria 3D
  renderer.toneMappingExposure = 2.05;

  renderer.domElement.style.filter =
    'brightness(1.20) saturate(1.38) ' +
    'drop-shadow(0 0 13px rgba(37,249,224,0.32))';

  membraneMat.color.setHex(0x9cfff2);
  membraneMat.emissive.setHex(0x30f6e4);
  membraneMat.emissiveIntensity = 0.95;
  membraneMat.opacity = 0.27;

  shellGlowMat.opacity = 0.13;
  cytoplasmMat.opacity = 0.22;

  dnaMat.color.setHex(0xa6d5ff);
  dnaMat.emissiveIntensity = 1.4;
  dnaSoftMat.emissiveIntensity = 1.05;

  goldMat.color.setHex(0xffe7a4);
  goldMat.emissive.setHex(0xffb43e);
  goldMat.emissiveIntensity = 1.1;

  flagellumMat.emissiveIntensity = 1.22;
  flagellumWarmMat.emissiveIntensity = 1.0;
