-- Enhanced Homework Fields Migration
-- Add new columns to support rich homework data instead of mock data

-- Add new columns to homework table
ALTER TABLE homework ADD COLUMN IF NOT EXISTS objectives JSON COMMENT 'Learning objectives array';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS activities JSON COMMENT 'Activities to complete array';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS materials JSON COMMENT 'Required materials array';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS parent_guidance TEXT COMMENT 'Guidance for parents';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS caps_alignment VARCHAR(255) COMMENT 'CAPS curriculum alignment';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS duration INT DEFAULT 30 COMMENT 'Estimated duration in minutes';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS difficulty ENUM('easy', 'intermediate', 'hard') DEFAULT 'intermediate' COMMENT 'Difficulty level';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS grade VARCHAR(50) COMMENT 'Grade level';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS term VARCHAR(50) COMMENT 'Academic term';
ALTER TABLE homework ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE homework ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_homework_difficulty ON homework(difficulty);
CREATE INDEX IF NOT EXISTS idx_homework_grade ON homework(grade);
CREATE INDEX IF NOT EXISTS idx_homework_caps ON homework(caps_alignment);

-- Update existing records with sample data (optional)
-- You can customize this based on your existing data
UPDATE homework 
SET 
    objectives = JSON_ARRAY(
        'Understand key concepts and principles',
        'Apply learning through practical exercises',
        'Develop critical thinking skills'
    ),
    activities = JSON_ARRAY(
        'Read assigned materials carefully',
        'Complete practice exercises',
        'Prepare for class discussion'
    ),
    materials = JSON_ARRAY(
        'Textbook relevant chapters',
        'Worksheet packet',
        'Calculator (if needed)'
    ),
    parent_guidance = 'Encourage your child to work through problems step-by-step. Help them organize their workspace and check their work before submission.',
    caps_alignment = CONCAT('CAPS Grade ', COALESCE(grade, '4'), ' - Term ', COALESCE(term, '2')),
    duration = 30,
    difficulty = 'intermediate'
WHERE objectives IS NULL;

-- Sample data for specific subjects (optional)
UPDATE homework 
SET 
    objectives = JSON_ARRAY(
        'Master basic arithmetic operations',
        'Solve word problems accurately',
        'Apply math concepts to real-world scenarios'
    ),
    activities = JSON_ARRAY(
        'Complete 10 addition problems',
        'Solve 5 word problems',
        'Practice with counting objects'
    ),
    materials = JSON_ARRAY(
        'Math textbook Chapter 3',
        'Counting manipulatives',
        'Calculator',
        'Practice worksheet'
    ),
    parent_guidance = 'Use everyday objects for counting. Help your child visualize math problems with real items like toys or snacks.',
    difficulty = 'easy'
WHERE subject = 'Mathematics' AND objectives IS NULL;

UPDATE homework 
SET 
    objectives = JSON_ARRAY(
        'Improve reading comprehension',
        'Expand vocabulary',
        'Practice writing skills'
    ),
    activities = JSON_ARRAY(
        'Read assigned story',
        'Complete comprehension questions',
        'Write summary paragraph'
    ),
    materials = JSON_ARRAY(
        'Reading book',
        'Vocabulary worksheet',
        'Writing paper',
        'Dictionary'
    ),
    parent_guidance = 'Read together with your child. Ask questions about the story and help them sound out difficult words.',
    difficulty = 'intermediate'
WHERE subject = 'English' AND objectives IS NULL;

UPDATE homework 
SET 
    objectives = JSON_ARRAY(
        'Understand scientific concepts',
        'Conduct simple experiments',
        'Observe and record findings'
    ),
    activities = JSON_ARRAY(
        'Read science chapter',
        'Complete experiment worksheet',
        'Record observations'
    ),
    materials = JSON_ARRAY(
        'Science textbook',
        'Experiment materials',
        'Observation notebook',
        'Safety goggles'
    ),
    parent_guidance = 'Supervise experiments and discuss what your child observes. Ask them to explain what they learned.',
    difficulty = 'hard'
WHERE subject = 'Science' AND objectives IS NULL;

-- Create push_subscriptions table for push notification functionality
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_endpoint (userId, endpoint(255)),
    INDEX idx_user_id (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show the updated schema
DESCRIBE homework;
DESCRIBE push_subscriptions;
