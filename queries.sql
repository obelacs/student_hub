CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Increased to 255 to accommodate bcrypt/Argon2 hashes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses(
    id SERIAL PRIMARY KEY,
    course_title VARCHAR(100) NOT NULL,
    course_code VARCHAR(8) NOT NULL,
    description TEXT, -- TEXT is usually better for descriptions than VARCHAR(255)
    semester VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_courses(
    id SERIAL PRIMARY KEY, -- Fixed order
    user_id INT NOT NULL,
    course_id INT NOT NULL,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_course
        FOREIGN KEY(course_id) 
        REFERENCES courses(id)
        ON DELETE CASCADE,
        
    -- Prevents a user from being enrolled in the exact same course twice
    UNIQUE(user_id, course_id)
);