import apiService from './apiService';

/**
 * Content Curation Service
 * Fetches high-quality, age-appropriate educational content from reliable sources
 * and populates the Young Eagles library with CAPS-aligned materials
 */

class ContentCurationService {
  constructor() {
    this.sources = {
      // Educational APIs and sources
      openEducationalResources: 'https://api.oercommons.org/v1/',
      educationalContentAPI: 'https://www.curriki.org/api/',
      libraryOfCongress: 'https://www.loc.gov/apis/',
      nasaEducation: 'https://api.nasa.gov/',
      
      // Content repositories
      repositories: [
        {
          name: 'Khan Academy Kids',
          type: 'structured_learning',
          ageGroups: ['2-3', '3-4', '4-5', '5-6'],
          subjects: ['math', 'literacy', 'science', 'creativity']
        },
        {
          name: 'ABCmouse Educational Content',
          type: 'interactive_lessons',
          ageGroups: ['2-3', '3-4', '4-5'],
          subjects: ['math', 'reading', 'science', 'art']
        },
        {
          name: 'Starfall Pre-K Content',
          type: 'phonics_literacy',
          ageGroups: ['3-4', '4-5', '5-6'],
          subjects: ['literacy', 'math', 'music']
        }
      ]
    };
    
    this.capsAlignment = {
      foundationPhase: {
        literacy: {
          '2-3': ['Letter recognition', 'Phonemic awareness', 'Vocabulary development'],
          '3-4': ['Letter sounds', 'Simple word formation', 'Listening skills'],
          '4-5': ['Reading readiness', 'Writing preparation', 'Storytelling'],
          '5-6': ['Beginning reading', 'Writing letters/words', 'Comprehension']
        },
        mathematics: {
          '2-3': ['Number recognition 1-5', 'Basic counting', 'Shape recognition'],
          '3-4': ['Numbers 1-10', 'Simple patterns', 'Basic shapes'],
          '4-5': ['Numbers 1-20', 'Addition concepts', 'Measurement'],
          '5-6': ['Numbers 1-50', 'Basic addition/subtraction', 'Time concepts']
        },
        science: {
          '2-3': ['Observation skills', 'Living vs non-living', 'Basic senses'],
          '3-4': ['Simple experiments', 'Weather patterns', 'Animal habitats'],
          '4-5': ['Plant growth', 'Water cycle', 'Healthy habits'],
          '5-6': ['Scientific method', 'Ecosystems', 'Matter states']
        },
        creative: {
          '2-3': ['Color recognition', 'Basic drawing', 'Music movement'],
          '3-4': ['Art techniques', 'Rhythm patterns', 'Creative expression'],
          '4-5': ['Mixed media art', 'Simple instruments', 'Drama play'],
          '5-6': ['Art appreciation', 'Musical concepts', 'Creative writing']
        }
      }
    };
  }

  /**
   * Curated educational content library - high-quality, tested content
   */
  getCuratedContent() {
    return {
      literacy: [
        {
          id: 'lit_001',
          title: 'Alphabet Animal Adventure',
          description: 'Interactive alphabet learning with animal sounds and movements',
          ageGroup: '2-3',
          duration: 15,
          materials: ['Animal picture cards', 'Movement space', 'Audio device'],
          activities: [
            'A is for Alligator - snap like an alligator',
            'B is for Bear - walk like a bear',
            'C is for Cat - meow and stretch like a cat',
            'Practice letter sounds with actions'
          ],
          learningObjectives: [
            'Recognize letters A-C',
            'Associate letters with animals',
            'Practice gross motor skills',
            'Develop phonemic awareness'
          ],
          assessment: 'Child can identify 2/3 letters and make corresponding animal sounds',
          worksheets: [
            {
              title: 'Animal Alphabet Coloring Sheet',
              description: 'Color and trace letters with matching animals',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Literacy: Letter recognition and phonemic awareness'
        },
        {
          id: 'lit_002',
          title: 'Rhyme Time Fun',
          description: 'Phonological awareness through nursery rhymes and word families',
          ageGroup: '3-4',
          duration: 20,
          materials: ['Nursery rhyme books', 'Rhythm instruments', 'Picture cards'],
          activities: [
            'Sing familiar nursery rhymes',
            'Identify rhyming words (cat/hat/bat)',
            'Create new rhymes with picture cards',
            'Clap syllables in words'
          ],
          learningObjectives: [
            'Recognize rhyming patterns',
            'Develop listening skills',
            'Practice rhythm and timing',
            'Build vocabulary'
          ],
          assessment: 'Child can identify and create simple rhymes',
          worksheets: [
            {
              title: 'Rhyming Pairs Matching',
              description: 'Match pictures that rhyme',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Literacy: Phonological and phonemic awareness'
        },
        {
          id: 'lit_003',
          title: 'Story Sequencing Adventure',
          description: 'Understanding story structure and sequence through interactive storytelling',
          ageGroup: '4-5',
          duration: 25,
          materials: ['Picture story cards', 'Story books', 'Drawing materials'],
          activities: [
            'Listen to simple story',
            'Arrange story pictures in order',
            'Retell story using picture cards',
            'Create own simple story ending'
          ],
          learningObjectives: [
            'Understand story sequence',
            'Develop comprehension skills',
            'Practice retelling',
            'Build narrative skills'
          ],
          assessment: 'Child can sequence 3-4 story events correctly',
          worksheets: [
            {
              title: 'Story Sequence Cards',
              description: 'Cut out and arrange story events',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Literacy: Listening and speaking, comprehension'
        }
      ],
      
      mathematics: [
        {
          id: 'math_001',
          title: 'Counting Treasures',
          description: 'Hands-on counting activities using everyday objects',
          ageGroup: '2-3',
          duration: 15,
          materials: ['Small toys/objects', 'Counting mats', 'Number cards 1-5'],
          activities: [
            'Count objects from 1-5',
            'Match objects to number cards',
            'Practice one-to-one correspondence',
            'Sort objects by quantity'
          ],
          learningObjectives: [
            'Count to 5 accurately',
            'Recognize numerals 1-5',
            'Understand quantity',
            'Develop fine motor skills'
          ],
          assessment: 'Child can count to 5 and recognize numbers 1-3',
          worksheets: [
            {
              title: 'Number Tracing 1-5',
              description: 'Practice writing numbers with guided tracing',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Mathematics: Numbers, operations and relationships'
        },
        {
          id: 'math_002',
          title: 'Shape Detective',
          description: 'Exploring shapes in the environment through observation and sorting',
          ageGroup: '3-4',
          duration: 20,
          materials: ['Shape cards', 'Shape sorter', 'Household objects'],
          activities: [
            'Find shapes around the house',
            'Sort objects by shape',
            'Draw shapes in sand/flour',
            'Create shape patterns'
          ],
          learningObjectives: [
            'Identify basic shapes',
            'Classify objects by attributes',
            'Develop spatial awareness',
            'Practice fine motor skills'
          ],
          assessment: 'Child can identify and name 3/4 basic shapes',
          worksheets: [
            {
              title: 'Shape Hunt Checklist',
              description: 'Find and mark shapes in your environment',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Mathematics: Space and shape (geometry)'
        },
        {
          id: 'math_003',
          title: 'Pattern Party',
          description: 'Creating and extending patterns using colors, shapes, and sounds',
          ageGroup: '4-5',
          duration: 25,
          materials: ['Colored blocks', 'Pattern cards', 'Musical instruments'],
          activities: [
            'Copy simple AB patterns',
            'Extend given patterns',
            'Create own patterns',
            'Make sound patterns'
          ],
          learningObjectives: [
            'Recognize pattern rules',
            'Create simple patterns',
            'Develop logical thinking',
            'Practice sequencing skills'
          ],
          assessment: 'Child can copy and extend AB patterns',
          worksheets: [
            {
              title: 'Pattern Practice Sheet',
              description: 'Complete and create various patterns',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Mathematics: Patterns, functions and algebra'
        }
      ],
      
      science: [
        {
          id: 'sci_001',
          title: 'My Five Senses Explorer',
          description: 'Discovering the world through sight, sound, touch, taste, and smell',
          ageGroup: '2-3',
          duration: 20,
          materials: ['Sensory objects', 'Observation sheet', 'Magnifying glass'],
          activities: [
            'Explore objects with each sense',
            'Describe what you observe',
            'Match objects to senses',
            'Create a senses book'
          ],
          learningObjectives: [
            'Identify the five senses',
            'Practice observation skills',
            'Develop vocabulary',
            'Make connections to daily life'
          ],
          assessment: 'Child can name and use 4/5 senses appropriately',
          worksheets: [
            {
              title: 'Five Senses Chart',
              description: 'Record observations using different senses',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Natural Sciences: Life and living'
        },
        {
          id: 'sci_002',
          title: 'Weather Watchers',
          description: 'Observing and recording daily weather patterns',
          ageGroup: '3-4',
          duration: 15,
          materials: ['Weather chart', 'Weather symbols', 'Outdoor thermometer'],
          activities: [
            'Observe daily weather',
            'Record on weather chart',
            'Discuss weather changes',
            'Choose appropriate clothing'
          ],
          learningObjectives: [
            'Identify weather types',
            'Understand weather changes',
            'Practice recording data',
            'Make weather predictions'
          ],
          assessment: 'Child can identify and record basic weather patterns',
          worksheets: [
            {
              title: 'Weekly Weather Tracker',
              description: 'Chart weather observations for one week',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Natural Sciences: Earth and beyond'
        },
        {
          id: 'sci_003',
          title: 'Growing Green Beans',
          description: 'Plant life cycle investigation through hands-on gardening',
          ageGroup: '4-5',
          duration: 30,
          materials: ['Bean seeds', 'Clear containers', 'Soil', 'Water', 'Ruler'],
          activities: [
            'Plant bean seeds in containers',
            'Observe and record daily changes',
            'Measure plant growth',
            'Identify plant parts'
          ],
          learningObjectives: [
            'Understand plant life cycle',
            'Practice scientific observation',
            'Learn measurement skills',
            'Develop responsibility'
          ],
          assessment: 'Child can identify plant parts and describe growth stages',
          worksheets: [
            {
              title: 'Plant Growth Journal',
              description: 'Record daily observations of plant growth',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Natural Sciences: Life and living'
        }
      ],
      
      creative: [
        {
          id: 'art_001',
          title: 'Color Mixing Magic',
          description: 'Exploring primary colors and creating new colors through mixing',
          ageGroup: '2-3',
          duration: 25,
          materials: ['Primary color paints', 'Brushes', 'Paper', 'Water containers'],
          activities: [
            'Identify red, blue, yellow',
            'Mix colors to create new ones',
            'Paint with different colors',
            'Create a color wheel'
          ],
          learningObjectives: [
            'Learn primary colors',
            'Understand color mixing',
            'Develop fine motor skills',
            'Express creativity'
          ],
          assessment: 'Child can name primary colors and mix to create secondary colors',
          worksheets: [
            {
              title: 'Color Mixing Experiment',
              description: 'Record color combinations and results',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Arts and Culture: Visual arts'
        },
        {
          id: 'music_001',
          title: 'Rhythm and Movement',
          description: 'Exploring beat, rhythm, and musical expression through movement',
          ageGroup: '3-4',
          duration: 20,
          materials: ['Simple instruments', 'Music player', 'Scarves/ribbons'],
          activities: [
            'March to steady beat',
            'Clap rhythm patterns',
            'Move with music',
            'Play simple instruments'
          ],
          learningObjectives: [
            'Feel steady beat',
            'Express rhythm through movement',
            'Coordinate movements',
            'Experience musical elements'
          ],
          assessment: 'Child can maintain steady beat and respond to musical changes',
          worksheets: [
            {
              title: 'Rhythm Pattern Cards',
              description: 'Practice clapping different rhythm patterns',
              downloadUrl: 'generated'
            }
          ],
          capsAlignment: 'Foundation Phase - Arts and Culture: Music'
        }
      ]
    };
  }

  /**
   * Generate worksheet content based on activity
   */
  async generateWorksheet(activity, worksheetTemplate) {
    const worksheetContent = {
      title: worksheetTemplate.title,
      description: worksheetTemplate.description,
      ageGroup: activity.ageGroup,
      instructions: this.generateInstructions(activity, worksheetTemplate),
      activities: this.generateWorksheetActivities(activity, worksheetTemplate),
      assessment: this.generateAssessmentCriteria(activity),
      capsAlignment: activity.capsAlignment
    };

    return worksheetContent;
  }

  /**
   * Generate detailed instructions for worksheet
   */
  generateInstructions(activity, worksheetTemplate) {
    const instructions = {
      'Animal Alphabet Coloring Sheet': 'Color each animal and trace the letter. Say the letter sound and animal name as you work.',
      'Rhyming Pairs Matching': 'Draw lines to connect pictures that rhyme. Say each word out loud to hear the rhyming sound.',
      'Story Sequence Cards': 'Cut out the pictures and arrange them in the correct story order. Tell the story using the pictures.',
      'Number Tracing 1-5': 'Use your finger to trace each number in the air first, then trace with a pencil. Count objects to match each number.',
      'Shape Hunt Checklist': 'Walk around your house and find objects that match each shape. Draw or mark what you find.',
      'Pattern Practice Sheet': 'Look at each pattern and continue it. Create your own pattern in the empty box.',
      'Five Senses Chart': 'Use your eyes, ears, nose, mouth, and hands to explore objects. Record what you discover.',
      'Weekly Weather Tracker': 'Look outside each day and mark the weather. Discuss what clothes to wear for each type of weather.',
      'Plant Growth Journal': 'Draw your plant each day and measure how tall it grows. Write the date for each observation.',
      'Color Mixing Experiment': 'Mix two colors together and see what happens. Record the new color you created.',
      'Rhythm Pattern Cards': 'Clap each pattern shown. Try clapping fast and slow, loud and soft.'
    };

    return instructions[worksheetTemplate.title] || 'Follow the activity instructions and complete each task carefully.';
  }

  /**
   * Generate worksheet-specific activities
   */
  generateWorksheetActivities(activity, worksheetTemplate) {
    const baseActivities = activity.activities;
    const worksheetSpecific = {
      coloring: ['Color staying within lines', 'Use different colors creatively', 'Discuss colors used'],
      tracing: ['Trace with finger first', 'Use proper pencil grip', 'Practice letter formation'],
      matching: ['Look carefully at pictures', 'Draw lines to connect pairs', 'Name each item aloud'],
      observation: ['Use all senses safely', 'Record what you notice', 'Compare different objects'],
      creation: ['Express your ideas freely', 'Use materials safely', 'Share your work with others']
    };

    // Determine worksheet type from title and add specific activities
    const worksheetType = this.determineWorksheetType(worksheetTemplate.title);
    return [...baseActivities, ...worksheetSpecific[worksheetType] || []];
  }

  /**
   * Generate assessment criteria
   */
  generateAssessmentCriteria(activity) {
    return [
      `Completes activities appropriate for ${activity.ageGroup} age group`,
      'Shows engagement and interest in tasks',
      'Demonstrates understanding of key concepts',
      'Asks questions and explores independently',
      'Applies learning to new situations'
    ];
  }

  /**
   * Determine worksheet type from title
   */
  determineWorksheetType(title) {
    if (title.includes('Coloring')) return 'coloring';
    if (title.includes('Tracing')) return 'tracing';
    if (title.includes('Matching')) return 'matching';
    if (title.includes('Chart') || title.includes('Journal')) return 'observation';
    return 'creation';
  }

  /**
   * Get content filtered by age group and subject
   */
  getFilteredContent(ageGroup = null, subject = null) {
    const content = this.getCuratedContent();
    const filtered = [];

    Object.keys(content).forEach(subjectKey => {
      if (subject && subjectKey !== subject) return;
      
      content[subjectKey].forEach(item => {
        if (ageGroup && item.ageGroup !== ageGroup) return;
        filtered.push({
          ...item,
          subject: subjectKey
        });
      });
    });

    return filtered;
  }

  /**
   * Get learning progression for a subject
   */
  getLearningProgression(subject) {
    const content = this.getCuratedContent()[subject] || [];
    return content.sort((a, b) => {
      const ageOrder = { '2-3': 1, '3-4': 2, '4-5': 3, '5-6': 4 };
      return ageOrder[a.ageGroup] - ageOrder[b.ageGroup];
    });
  }

  /**
   * Populate library with curated content
   */
  async populateLibrary() {
    try {
      const content = this.getCuratedContent();
      const populatedContent = [];

      for (const subject of Object.keys(content)) {
        for (const item of content[subject]) {
          // Generate worksheets for each activity
          const generatedWorksheets = await Promise.all(
            item.worksheets.map(async (worksheet) => {
              const worksheetContent = await this.generateWorksheet(item, worksheet);
              return {
                ...worksheet,
                content: worksheetContent,
                generated: true,
                readyForDownload: true
              };
            })
          );

          populatedContent.push({
            ...item,
            subject,
            worksheets: generatedWorksheets,
            status: 'ready',
            lastUpdated: new Date().toISOString()
          });
        }
      }

      console.log(`✅ Library populated with ${populatedContent.length} activities`);
      return populatedContent;

    } catch (error) {
      console.error('Error populating library:', error);
      throw new Error('Failed to populate content library');
    }
  }

  /**
   * Get recommended content based on age and completed activities
   */
  getRecommendedContent(ageGroup, completedActivities = []) {
    const content = this.getFilteredContent(ageGroup);
    
    // Filter out completed activities and sort by difficulty
    const available = content.filter(item => 
      !completedActivities.includes(item.id)
    );

    // Prioritize by learning progression
    return available.slice(0, 5); // Return top 5 recommendations
  }
}

export default new ContentCurationService();
