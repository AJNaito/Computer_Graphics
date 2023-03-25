var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	// Check Shadow
	vec3 color = vec3(0,0,0);
	float bias = 0.0001;
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		// Shadow Ray
		Ray r;
		r.pos = position + (bias * normal);
		r.dir = normalize(lights[i].position - position);
		HitInfo hit;
		bool inShadow = IntersectRay(hit, r);
		//for (int i = 0; i < NUM_SPHERES; ++i) {
//			vec3 center = spheres[i].center;

//			float a = dot(r.dir, r.dir);
//			float b = dot(2.0 * r.dir, r.pos - center);
//			float c = dot(r.pos - center, r.pos - center) - pow(spheres[i].radius, 2.0);
		
//			float delta = pow(b, 2.0) - (4.0 * a * c);
//max
//			if (delta < 0.0) {
//				continue; // ray misses this sphere -- continue to next sphere
//			}
//			float time = ((-b) - sqrt(delta)) / (2.0 * a);
			
//			if (time > bias) {
//				inShadow = true;
//				break;
//			}
		//}

		// TO-DO: If not shadowed, perform shading using the Blinn model
		if (!inShadow) {
			vec3 L = r.dir;

			vec3 diffuse = max(dot(L,normal), 0.0) * (mtl.k_d * lights[i].intensity);
			vec3 H = normalize(L + view);
			vec3 specular = pow(max(dot(normal, H), 0.0), mtl.n) * (mtl.k_s * lights[i].intensity);

			color += diffuse + specular;	// change this line
		}


	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
// Complete this
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	float bias = 0.0001;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		// TO-DO: If intersection is found, update the given HitInfo
		vec3 center = spheres[i].center;

		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, ray.pos - center);
		float c = dot(ray.pos - center, ray.pos - center) - pow(spheres[i].radius, 2.0);
		
		float delta = pow(b, 2.0) - (4.0 * a * c);

		if (delta < 0.0) {
			continue; // ray misses this sphere -- continue to next sphere
		}

		// Only interested in FIRST hit
		float time = (-b - sqrt(delta)) / (2.0 * a);
		if (time < hit.t && time > bias) {
			//current time is closer than previou -- update info
			foundHit = true;

			hit.t = time;
			hit.position = ray.pos + time * ray.dir;
			// sphere normal is position - center
			hit.normal = normalize(hit.position - center);
			hit.mtl = spheres[i].mtl;
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
// Complete this
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	float bias = 0.0001;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			// TO-DO: Initialize the reflection ray
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			r.pos = hit.position + (hit.normal * bias);
			r.dir = normalize(2.0 * (dot(view, hit.normal)) * hit.normal - view);

			
			if ( IntersectRay( h, r ) ) {
				// rendering equation
				// TO-DO: Hit found, so shade the hit point
				view = -r.dir;
				clr += Shade(h.mtl, h.position, h.normal, view) * k_s;

				hit.position = h.position;
				hit.normal = h.normal;
				hit.mtl = h.mtl;
				k_s = k_s * h.mtl.k_s;
				// TO-DO: Update the loop variables for tracing the next reflection ray
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;