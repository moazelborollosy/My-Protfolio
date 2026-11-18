# ==============================================================================
# DYNAMODB SINGLE-TABLE FOR PORTFOLIO CONTENT
# ==============================================================================

resource "aws_dynamodb_table" "portfolio" {
  name         = "${local.prefix}-portfolio"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-portfolio"
  })
}

# ==============================================================================
# INITIAL SEED ITEMS (IGNORED AFTER CREATION SO ADMIN EDITS PERSIST)
# ==============================================================================

locals {
  seed_items = {
    "PROFILE#CONFIG" = {
      pk                  = { S = "PROFILE" }
      sk                  = { S = "CONFIG" }
      isVisible           = { BOOL = true }
      availabilityHero    = { S = "Open to Werkstudent & internship roles" }
      availabilityContact = { S = "Open to opportunities" }
      kicker              = { S = "Berlin, Germany · Mechatronics" }
      firstName           = { S = "Moaz" }
      lastName            = { S = "Elborollosy" }
      heroDescription     = { S = "I design mechanisms, write control logic, and build software. Mechatronics Engineering student in Berlin, focused on robotics and automation." }
      heroTagsRow1        = { L = [{ S = "Robotics" }, { S = "Automation" }, { S = "Embedded Systems" }] }
      heroTagsRow2        = { L = [{ S = "C/C++" }, { S = "Python" }, { S = "ROS 2" }, { S = "SolidWorks" }] }
      aboutHeadline       = { S = "I’m Moaz, a Mechatronics Engineering student at German International University in Berlin." }
      aboutBody           = { S = "My projects span mechanical assemblies, Arduino control, circuit simulation, and Java software. I’m looking for a working-student role or internship where I can contribute to real engineering problems, learn from an experienced team, and develop my skills in robotics and automation." }
      spokenLanguages     = { S = "Languages: English C1 · German A2 · Arabic native" }
      contactLocation     = { S = "Berlin, Germany" }
      links = {
        M = {
          email    = { S = "mozaelborollosy@gmail.com" }
          linkedin = { S = "https://www.linkedin.com/in/moaz-elborollosy-501885338/" }
          github   = { S = "https://github.com/moazelborollosy" }
          cv       = { S = "/assets/Moaz-Elborollosy-CV.pdf" }
        }
      }
      lastPublishedAt = { S = "2026-11-18T00:00:00Z" }
      lastModifiedAt  = { S = "2026-11-18T00:00:00Z" }
    }

    # --- PROJECTS (ULID Sort Keys + Gapped displayOrder) ---
    "PROJECT#01JCY000000000000000000001" = {
      pk           = { S = "PROJECT" }
      sk           = { S = "01JCY000000000000000000001" }
      slug         = { S = "drone" }
      displayOrder = { N = "10" }
      isVisible    = { BOOL = true }
      title        = { S = "Custom Quadcopter Drone" }
      category     = { S = "Mechanical" }
      accentTag    = { S = "CAD & INTEGRATION" }
      icon         = { S = "Plane" }
      description  = { S = "A complete multirotor assembly, designed around the challenge of fitting mechanical and electronic components into a compact airframe." }
      contribution = { S = "Designed the airframe and integrated the electronics and flight-controller packaging in SolidWorks. Used motion studies to inspect propeller rotation and component clearances." }
      outcome      = { S = "Completed a full CAD assembly and checked mechanical tolerances across the design." }
      technologies = { L = [{ S = "SolidWorks" }, { S = "Assembly Design" }, { S = "Motion Studies" }] }
      github       = { S = "" }
    }
    "PROJECT#01JCY000000000000000000002" = {
      pk           = { S = "PROJECT" }
      sk           = { S = "01JCY000000000000000000002" }
      slug         = { S = "gripper" }
      displayOrder = { N = "20" }
      isVisible    = { BOOL = true }
      title        = { S = "Robotic Gripper" }
      category     = { S = "Mechanical" }
      accentTag    = { S = "MECHANISM DESIGN" }
      icon         = { S = "Wrench" }
      description  = { S = "A linkage-driven gripper that translates coordinated mechanical motion into a grasping action." }
      contribution = { S = "Designed and assembled the mechanism in SolidWorks, configuring kinematic mates to coordinate the motion of the fingers." }
      outcome      = { S = "Validated the mechanism’s movement within the CAD assembly." }
      technologies = { L = [{ S = "SolidWorks" }, { S = "Kinematic Mates" }, { S = "Linkages" }] }
      github       = { S = "" }
    }
    "PROJECT#01JCY000000000000000000003" = {
      pk           = { S = "PROJECT" }
      sk           = { S = "01JCY000000000000000000003" }
      slug         = { S = "arm" }
      displayOrder = { N = "30" }
      isVisible    = { BOOL = true }
      title        = { S = "Embedded Robotic Arm" }
      category     = { S = "Embedded" }
      accentTag    = { S = "MECHANICS + CONTROL" }
      icon         = { S = "Bot" }
      description  = { S = "A multi-axis robotic arm connecting mechanical design with Arduino-based servo control." }
      contribution = { S = "Designed the mechanical structure and joint configuration in SolidWorks, then wrote Arduino C++ logic for kinematic calculations and coordinated servo movement." }
      outcome      = { S = "Connected the CAD design workflow with synchronized control across multiple joints." }
      technologies = { L = [{ S = "SolidWorks" }, { S = "Arduino" }, { S = "C++" }, { S = "Kinematics" }] }
      github       = { S = "" }
    }
    "PROJECT#01JCY000000000000000000004" = {
      pk           = { S = "PROJECT" }
      sk           = { S = "01JCY000000000000000000004" }
      slug         = { S = "filter" }
      displayOrder = { N = "40" }
      isVisible    = { BOOL = true }
      title        = { S = "Active Low-Pass Filter" }
      category     = { S = "Embedded" }
      accentTag    = { S = "CIRCUIT DESIGN" }
      icon         = { S = "CircuitBoard" }
      description  = { S = "An active filter circuit designed to reduce high-frequency noise while preserving the useful signal." }
      contribution = { S = "Designed and simulated the filter, checking its frequency response and attenuation behavior." }
      outcome      = { S = "Verified high-frequency noise attenuation through circuit simulation." }
      technologies = { L = [{ S = "Circuit Design" }, { S = "Simulation" }, { S = "Signal Processing" }] }
      github       = { S = "" }
    }
    "PROJECT#01JCY000000000000000000005" = {
      pk           = { S = "PROJECT" }
      sk           = { S = "01JCY000000000000000000005" }
      slug         = { S = "interpreter" }
      displayOrder = { N = "50" }
      isVisible    = { BOOL = true }
      title        = { S = "Assembly Interpreter" }
      category     = { S = "Software" }
      accentTag    = { S = "COMPUTER ARCHITECTURE" }
      icon         = { S = "Cpu" }
      description  = { S = "A Java interpreter that parses assembly instructions and executes them in a simulated CPU with registers, memory, and status flags." }
      contribution = { S = "Built parsing, decoding, and instruction execution logic as part of a team project, with error handling for invalid instructions and runtime failures." }
      outcome      = { S = "Passed all required and bonus test cases; the team earned the highest overall project score." }
      technologies = { L = [{ S = "Java" }, { S = "Parsing" }, { S = "CPU Simulation" }, { S = "Exception Handling" }] }
      github       = { S = "https://github.com/moazelborollosy/Assembly-Interpreter" }
    }
    "PROJECT#01JCY000000000000000000006" = {
      pk           = { S = "PROJECT" }
      sk           = { S = "01JCY000000000000000000006" }
      slug         = { S = "game" }
      displayOrder = { N = "60" }
      isVisible    = { BOOL = true }
      title        = { S = "Clans of the Eclipse" }
      category     = { S = "Software" }
      accentTag    = { S = "OBJECT-ORIENTED SOFTWARE" }
      icon         = { S = "Braces" }
      description  = { S = "A turn-based strategy game with a Java game engine and graphical interface." }
      contribution = { S = "Developed core gameplay logic and exception handling, and designed and implemented the GUI to connect player actions with the engine." }
      outcome      = { S = "Delivered stable gameplay with a responsive graphical interface." }
      technologies = { L = [{ S = "Java" }, { S = "OOP" }, { S = "GUI" }, { S = "Game Logic" }] }
      github       = { S = "https://github.com/moazelborollosy/Clan-of-the-eclipce" }
    }

    # --- SKILL GROUPS ---
    "SKILL_GROUP#01JCY000000000000000000101" = {
      pk           = { S = "SKILL_GROUP" }
      sk           = { S = "01JCY000000000000000000101" }
      displayOrder = { N = "10" }
      isVisible    = { BOOL = true }
      title        = { S = "CAD & Prototyping" }
      icon         = { S = "Cog" }
      skills       = { L = [{ S = "SolidWorks" }, { S = "AutoCAD" }, { S = "3D Printing & Prototyping" }, { S = "Mechanical Assemblies" }] }
    }
    "SKILL_GROUP#01JCY000000000000000000102" = {
      pk           = { S = "SKILL_GROUP" }
      sk           = { S = "01JCY000000000000000000102" }
      displayOrder = { N = "20" }
      isVisible    = { BOOL = true }
      title        = { S = "Robotics & Automation" }
      icon         = { S = "Bot" }
      skills       = { L = [{ S = "ROS 2" }, { S = "Arduino & PIC" }, { S = "Circuit Design" }, { S = "Signal Processing" }] }
    }
    "SKILL_GROUP#01JCY000000000000000000103" = {
      pk           = { S = "SKILL_GROUP" }
      sk           = { S = "01JCY000000000000000000103" }
      displayOrder = { N = "30" }
      isVisible    = { BOOL = true }
      title        = { S = "Programming" }
      icon         = { S = "Braces" }
      skills       = { L = [{ S = "C / C++" }, { S = "Python" }, { S = "Java" }, { S = "Assembly & HTML" }] }
    }
    "SKILL_GROUP#01JCY000000000000000000104" = {
      pk           = { S = "SKILL_GROUP" }
      sk           = { S = "01JCY000000000000000000104" }
      displayOrder = { N = "40" }
      isVisible    = { BOOL = true }
      title        = { S = "Developer Tools" }
      icon         = { S = "GitBranch" }
      skills       = { L = [{ S = "Linux (Ubuntu)" }, { S = "Git & GitHub" }, { S = "VS Code" }] }
    }

    # --- ACHIEVEMENTS ---
    "ACHIEVEMENT#01JCY000000000000000000201" = {
      pk           = { S = "ACHIEVEMENT" }
      sk           = { S = "01JCY000000000000000000201" }
      displayOrder = { N = "10" }
      isVisible    = { BOOL = true }
      title        = { S = "Full merit scholarship" }
      text         = { S = "Selected on academic merit to complete undergraduate studies in Germany." }
      icon         = { S = "GraduationCap" }
    }
    "ACHIEVEMENT#01JCY000000000000000000202" = {
      pk           = { S = "ACHIEVEMENT" }
      sk           = { S = "01JCY000000000000000000202" }
      displayOrder = { N = "20" }
      isVisible    = { BOOL = true }
      title        = { S = "Highest team project score" }
      text         = { S = "Assembly interpreter: all required and bonus test cases passed." }
      icon         = { S = "Trophy" }
    }
    "ACHIEVEMENT#01JCY000000000000000000203" = {
      pk           = { S = "ACHIEVEMENT" }
      sk           = { S = "01JCY000000000000000000203" }
      displayOrder = { N = "30" }
      isVisible    = { BOOL = true }
      title        = { S = "1.16 academic GPA" }
      text         = { S = "German grading scale · Grade A · German International University." }
      icon         = { S = "Cpu" }
    }

    # --- INTERESTS ---
    "INTEREST#01JCY000000000000000000301" = {
      pk           = { S = "INTEREST" }
      sk           = { S = "01JCY000000000000000000301" }
      displayOrder = { N = "10" }
      isVisible    = { BOOL = true }
      label        = { S = "Robotics" }
      icon         = { S = "Bot" }
    }
    "INTEREST#01JCY000000000000000000302" = {
      pk           = { S = "INTEREST" }
      sk           = { S = "01JCY000000000000000000302" }
      displayOrder = { N = "20" }
      isVisible    = { BOOL = true }
      label        = { S = "Industrial Automation" }
      icon         = { S = "Factory" }
    }
    "INTEREST#01JCY000000000000000000303" = {
      pk           = { S = "INTEREST" }
      sk           = { S = "01JCY000000000000000000303" }
      displayOrder = { N = "30" }
      isVisible    = { BOOL = true }
      label        = { S = "Autonomous Systems" }
      icon         = { S = "ScanLine" }
    }
    "INTEREST#01JCY000000000000000000304" = {
      pk           = { S = "INTEREST" }
      sk           = { S = "01JCY000000000000000000304" }
      displayOrder = { N = "40" }
      isVisible    = { BOOL = true }
      label        = { S = "Control Systems" }
      icon         = { S = "CircuitBoard" }
    }
    "INTEREST#01JCY000000000000000000305" = {
      pk           = { S = "INTEREST" }
      sk           = { S = "01JCY000000000000000000305" }
      displayOrder = { N = "50" }
      isVisible    = { BOOL = true }
      label        = { S = "Software Engineering" }
      icon         = { S = "Braces" }
    }
    "INTEREST#01JCY000000000000000000306" = {
      pk           = { S = "INTEREST" }
      sk           = { S = "01JCY000000000000000000306" }
      displayOrder = { N = "60" }
      isVisible    = { BOOL = true }
      label        = { S = "Drone Technology" }
      icon         = { S = "Plane" }
    }

    # --- EDUCATION ---
    "EDUCATION#01JCY000000000000000000401" = {
      pk               = { S = "EDUCATION" }
      sk               = { S = "01JCY000000000000000000401" }
      displayOrder     = { N = "10" }
      isVisible        = { BOOL = true }
      startYear        = { S = "2024" }
      dateRange        = { S = "September 2024 — July 2028 (expected)" }
      institution      = { S = "German International University" }
      institutionShort = { S = "(GIU)" }
      degree           = { S = "B.Sc. in Mechatronics Engineering" }
      location         = { S = "Berlin, Germany" }
      gpa              = { S = "GPA 1.16 · German scale" }
      coursework       = { S = "Relevant coursework: Kinematics & Robotics, Control Systems, Signals & Systems, Embedded Systems, Microcontroller Programming, and Computer Architecture." }
    }
  }
}

resource "aws_dynamodb_table_item" "seed" {
  for_each   = local.seed_items
  table_name = aws_dynamodb_table.portfolio.name
  hash_key   = aws_dynamodb_table.portfolio.hash_key
  range_key  = aws_dynamodb_table.portfolio.range_key
  item       = jsonencode(each.value)

  lifecycle {
    ignore_changes = [item]
  }
}
