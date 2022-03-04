import {
	AssetType,
	BackgroundMode,
	BlinnPhongMaterial,
	Camera,
	DirectLight,
	Engine,
	Entity,
	MeshRenderer,
	PointLight,
	PrimitiveMesh,
	SkyBoxMaterial,
	Texture2D,
	TextureCubeMap,
	UnlitMaterial,
	Vector3,
	WebGLEngine,
} from "oasis-engine";
import { OrbitControl } from "@oasis-engine/controls";
import { MyRotationComponent } from "./MyRotationComponent";
import { MyRevolutionComponent } from "./MyRevolutionComponent";

export async function createOasis() {
	const engine = new WebGLEngine("canvas");
	engine.canvas.resizeByClientSize();
	const scene = engine.sceneManager.activeScene;
	const rootEntity = scene.createRootEntity();

	// init camera
	const cameraEntity = rootEntity.createChild("camera");
	cameraEntity.addComponent(Camera);
	const pos = cameraEntity.transform.position;
	pos.setValue(10, 10, 10);
	cameraEntity.transform.position = pos;
	cameraEntity.transform.lookAt(new Vector3(0, 0, 0));

	// init light
	scene.ambientLight.diffuseSolidColor.setValue(1, 1, 1, 1);
	scene.ambientLight.diffuseIntensity = 1.2;
	
	// // 添加方向光
	// const directEntity = rootEntity.createChild("direct-light");
	// const directLight = directEntity.addComponent(DirectLight);
	// directLight.color.setValue(0, 1, 0, 1);


	// 添加镜头控制器
	cameraEntity.addComponent(OrbitControl);

	// // init cube
	// const cubeEntity = rootEntity.createChild("cube");
	// const renderer = cubeEntity.addComponent(MeshRenderer);
	// renderer.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2);
	// const mtl = new BlinnPhongMaterial(engine);
	// // mtl.baseColor.setValue(0, 0.8, 0.5 , 1);
	// // mtl.baseColor.setValue(1, 0, 0 , 1);
	// renderer.setMaterial(mtl);

	// // // transform 使用
	// // const cubeTransform = cubeEntity.transform;
	// // cubeTransform.setPosition(4, 2, 0);
	// // // cubeTransform.setRotation(0, 45, 0);
	// // // cubeTransform.setScale(2, 2, 2);

	// // 加载纹理
	// const cubeTex = await engine.resourceManager.load<Texture2D>({
	// 	url: "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*ArCHTbfVPXUAAAAAAAAAAAAAARQnAQ",
	// 	type: AssetType.Texture2D
	// });
	// mtl.baseTexture = cubeTex;

	// 创建天空盒
	await createSkyBox(engine);

	// 创建太阳系的虚拟节点
	const solarSystem = rootEntity.createChild("solar_system");

	// 太阳
	createSun(engine, solarSystem);

	// 创建火星
	createPlanet(engine, solarSystem, 1, 0.2, "https://gw.alipayobjects.com/mdn/rms_37b9d9/afts/img/A*4A66QZ8LtGcAAAAAAAAAAAAAARQnAQ", 0.0024);

	// 创建地月子系统
	const earthSystem = solarSystem.createChild("earth_system");
	earthSystem.transform.setPosition(2, 0, 0);
	earthSystem.addComponent(MyRevolutionComponent);

	createPlanet(engine, earthSystem, 0, 0.25, "https://gw.alipayobjects.com/mdn/rms_37b9d9/afts/img/A*gSgLRpgkvEQAAAAAAAAAAAAAARQnAQ", 0.0029);
  createPlanet(engine, earthSystem, 0.6, 0.1, "https://gw.alipayobjects.com/mdn/rms_37b9d9/afts/img/A*moYmRYhxitQAAAAAAAAAAAAAARQnAQ");

	engine.run();
}

async function createSkyBox(engine: Engine) {
	const cubeTextureResource = {
		type: AssetType.TextureCube,
		urls: [
			'https://gw.alipayobjects.com/mdn/rms_df2e25/afts/img/A*tQ1JTIyV2fcAAAAAAAAAAAAAARQnAQ', // px - right
			'https://gw.alipayobjects.com/mdn/rms_df2e25/afts/img/A*WgekSK_-Mw8AAAAAAAAAAAAAARQnAQ', // nx - left
			'https://gw.alipayobjects.com/mdn/rms_df2e25/afts/img/A*0zeFSoU2r4sAAAAAAAAAAAAAARQnAQ', // py - top
			'https://gw.alipayobjects.com/mdn/rms_df2e25/afts/img/A*yckZTZOAYRoAAAAAAAAAAAAAARQnAQ', // ny - bottom
			'https://gw.alipayobjects.com/mdn/rms_df2e25/afts/img/A*uXpfRb6YBCMAAAAAAAAAAAAAARQnAQ', // pz - front
			'https://gw.alipayobjects.com/mdn/rms_df2e25/afts/img/A*0jNmSYvWxVUAAAAAAAAAAAAAARQnAQ', // nz - back
		]
	};

	const cubemap = await engine.resourceManager.load<TextureCubeMap>(cubeTextureResource);
	const skyboxMtl = new SkyBoxMaterial(engine);
	skyboxMtl.textureCubeMap = cubemap;

	const background = engine.sceneManager.activeScene.background;
	background.mode = BackgroundMode.Sky;
	background.sky.material = skyboxMtl;
	background.sky.mesh = PrimitiveMesh.createCuboid(engine, 100, 100, 100);
}

async function createSun(engine: Engine, parent: Entity) {
	// 在原点创建一个实体
	const sunEntity = parent.createChild("sun");
	
	// 添加渲染组件
	const renderer = sunEntity.addComponent(MeshRenderer);
	renderer.mesh = PrimitiveMesh.createSphere(engine);
	const material = await createMaterial(engine, true, "https://gw.alipayobjects.com/mdn/rms_37b9d9/afts/img/A*H-ylQ4SI5GIAAAAAAAAAAAAAARQnAQ");
	renderer.setMaterial(material);

	// 添加点光源组件
	const lgt = sunEntity.addComponent(PointLight);
	lgt.distance = 1000;

	// 添加“自转”组件
	sunEntity.addComponent(MyRotationComponent);
	return sunEntity;
}

async function createPlanet(engine: Engine, parent: Entity, distance: number, radius: number, url: string, speed: number = 0.001) {
	// 创建行星的实体对象
	const planetEntity = parent.createChild("planet");
	planetEntity.transform.setPosition(distance, 0, 0);

	// 添加渲染组件
	const renderer = planetEntity.addComponent(MeshRenderer);
	renderer.mesh = PrimitiveMesh.createSphere(engine, radius);
	const material = await createMaterial(engine, false, url);
	renderer.setMaterial(material);

	// 添加“自转”组件
	planetEntity.addComponent(MyRotationComponent);
	// 添加“公转”组件
	const revolution = planetEntity.addComponent(MyRevolutionComponent);
	revolution.speed = speed;
	return planetEntity;
}

async function createMaterial(engine: Engine, isUnlit: boolean, url: string) {
	const tex = await engine.resourceManager.load<Texture2D>({
		url: url,
		type: AssetType.Texture2D
	});

	let material = null;
	if (isUnlit) {
		material = new UnlitMaterial(engine);
	} else {
		material = new BlinnPhongMaterial(engine);
	}
	material.baseTexture = tex;

	return material;
}

createOasis();