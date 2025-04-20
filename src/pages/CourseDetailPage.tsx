// pages/CourseDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Header,
    SpaceBetween,
    Box,
    Button,
    ExpandableSection,
    ColumnLayout,
    Tabs,
    ContentLayout,
    Cards,
    Badge,
    Grid,
    Alert
} from '@cloudscape-design/components';
import MainLayout from '../layouts/MainLayout';

// 강의자 타입
interface Instructor {
    name: string;
    title: string;
    company: string;
    bio: string;
    imageUrl?: string;
}

// 세션 타입
interface Session {
    title: string;
    date: string;
    duration: string;
    topics: string[];
}

// 과정 타입
interface Course {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    level: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    prerequisites: string[];
    learningObjectives: string[];
    sessions: Session[];
    materials: { title: string; description: string; url: string }[];
    instructors: Instructor[];
    price: string;
    enrollmentStatus: 'Open' | 'Closed' | 'Full';
}

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 실제 구현에서는 API에서 과정 데이터를 가져옵니다
        // 여기서는 임시 데이터를 사용합니다
        setTimeout(() => {
            if (courseId === 'cloud-practitioner') {
                setCourse({
                    id: 'cloud-practitioner',
                    title: 'AWS Cloud Practitioner Essentials',
                    description: 'Comprehensive introduction to AWS Cloud concepts, services, and security',
                    longDescription: 'This course is designed to help individuals understand AWS Cloud concepts, AWS services, security, architecture, pricing, and support. It provides a detailed overview of the AWS Cloud, designed to help you make informed decisions and build a strong foundation of AWS knowledge.',
                    level: 'Foundational',
                    startDate: '2025-04-20',
                    endDate: '2025-04-21',
                    location: 'Online',
                    format: 'Instructor-led virtual training',
                    prerequisites: [
                        'Basic IT knowledge',
                        'Understanding of cloud computing concepts'
                    ],
                    learningObjectives: [
                        'Define what the AWS Cloud is and the basic global infrastructure',
                        'Describe basic AWS Cloud architectural principles',
                        'Describe the AWS Cloud value proposition',
                        'Describe key services on the AWS platform and their common use cases',
                        'Describe basic security and compliance aspects of the AWS platform and the shared security model'
                    ],
                    sessions: [
                        {
                            title: 'Day 1: Introduction to Cloud Computing and AWS',
                            date: 'April 20, 2025 (9:00 AM - 5:00 PM)',
                            duration: '8 hours',
                            topics: ['Cloud Computing Concepts', 'AWS Global Infrastructure', 'Core AWS Services']
                        },
                        {
                            title: 'Day 2: Security, Architecture, and Support',
                            date: 'April 21, 2025 (9:00 AM - 5:00 PM)',
                            duration: '8 hours',
                            topics: ['AWS Security', 'AWS Architecture', 'Pricing and Support']
                        }
                    ],
                    materials: [
                        {
                            title: 'Course Slides',
                            description: 'PDF of all presentation slides',
                            url: '#'
                        },
                        {
                            title: 'AWS Documentation',
                            description: 'Official documentation for AWS services',
                            url: 'https://docs.aws.amazon.com'
                        }
                    ],
                    instructors: [
                        {
                            name: 'Jane Smith',
                            title: 'AWS Certified Trainer',
                            company: 'AWS Training & Certification',
                            bio: 'Jane has 10+ years of experience in cloud computing and has helped hundreds of students prepare for AWS certification exams.'
                        }
                    ],
                    price: '\$699',
                    enrollmentStatus: 'Open'
                });
                setLoading(false);
            } else {
                setError('Course not found');
                setLoading(false);
            }
        }, 1000); // 1초 지연으로 로딩 상태 시뮬레이션
    }, [courseId]);

    if (loading) {
        return (
            <MainLayout title="Loading Course Details...">
                <Box textAlign="center" padding="l">
                    Loading course information...
                </Box>
            </MainLayout>
        );
    }

    if (error || !course) {
        return (
            <MainLayout title="Course Not Found">
                <Alert type="error" header="Course not found">
                    The requested course could not be found. Please check the URL and try again.
                    <Box padding={{ top: 'm' }}>
                        <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
                    </Box>
                </Alert>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={course.title}>
            <ContentLayout
                header={
                    <Header
                        variant="h1"
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
                                <Button variant="primary" disabled={course.enrollmentStatus !== 'Open'}>
                                    {course.enrollmentStatus === 'Open' ? 'Enroll Now' : 'Enrollment ' + course.enrollmentStatus}
                                </Button>
                            </SpaceBetween>
                        }
                        counter={`Level: \${course.level}`}
                    >
                        {course.title}
                    </Header>
                }
            >
                <SpaceBetween size="l">
                    {/* 과정 요약 */}
                    <Container>
                        <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                            <div>
                                <h2>Course Overview</h2>
                                <p>{course.longDescription}</p>

                                <Box padding={{ top: 'l' }}>
                                    <h3>Learning Objectives</h3>
                                    <ul>
                                        {course.learningObjectives.map((objective, index) => (
                                            <li key={index}>{objective}</li>
                                        ))}
                                    </ul>
                                </Box>

                                <Box padding={{ top: 'l' }}>
                                    <h3>Prerequisites</h3>
                                    <ul>
                                        {course.prerequisites.map((prereq, index) => (
                                            <li key={index}>{prereq}</li>
                                        ))}
                                    </ul>
                                </Box>
                            </div>

                            <div>
                                <Container>
                                    <SpaceBetween size="l">
                                        <Box>
                                            <h3>Course Details</h3>
                                            <Box variant="p">
                                                <strong>Dates:</strong> {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                                            </Box>
                                            <Box variant="p">
                                                <strong>Location:</strong> {course.location}
                                            </Box>
                                            <Box variant="p">
                                                <strong>Format:</strong> {course.format}
                                            </Box>
                                            <Box variant="p">
                                                <strong>Price:</strong> {course.price}
                                            </Box>
                                            <Box variant="p">
                                                <strong>Status:</strong> <Badge color={course.enrollmentStatus === 'Open' ? 'green' : course.enrollmentStatus === 'Full' ? 'red' : 'blue'}>{course.enrollmentStatus}</Badge>
                                            </Box>
                                        </Box>

                                        {course.enrollmentStatus === 'Open' && (
                                            <Button variant="primary" fullWidth>Enroll Now</Button>
                                        )}
                                    </SpaceBetween>
                                </Container>
                            </div>
                        </Grid>
                    </Container>

                    {/* 세부 정보 탭 */}
                    <Tabs
                        tabs={[
                            {
                                label: "Schedule",
                                id: "schedule",
                                content: (
                                    <Container>
                                        <SpaceBetween size="l">
                                            {course.sessions.map((session, index) => (
                                                <Container
                                                    key={index}
                                                    header={<Header variant="h3">{session.title}</Header>}
                                                >
                                                    <ColumnLayout columns={2} variant="text-grid">
                                                        <div>
                                                            <Box variant="h4">Date & Time</Box>
                                                            <Box variant="p">{session.date}</Box>
                                                            <Box variant="p">Duration: {session.duration}</Box>
                                                        </div>
                                                        <div>
                                                            <Box variant="h4">Topics</Box>
                                                            <ul>
                                                                {session.topics.map((topic, i) => (
                                                                    <li key={i}>{topic}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </ColumnLayout>
                                                </Container>
                                            ))}
                                        </SpaceBetween>
                                    </Container>
                                )
                            },
                            {
                                label: "Instructors",
                                id: "instructors",
                                content: (
                                    <Container>
                                        <SpaceBetween size="l">
                                            {course.instructors.map((instructor, index) => (
                                                <Grid
                                                    key={index}
                                                    gridDefinition={[
                                                        { colspan: { default: 12, xxs: 2 } },
                                                        { colspan: { default: 12, xxs: 10 } }
                                                    ]}
                                                >
                                                    <Box padding="s">
                                                        {instructor.imageUrl ? (
                                                            <img
                                                                src={instructor.imageUrl}
                                                                alt={instructor.name}
                                                                style={{
                                                                    maxWidth: '100%',
                                                                    borderRadius: '50%'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    width: '100%',
                                                                    paddingBottom: '100%',
                                                                    backgroundColor: '#f2f3f3',
                                                                    borderRadius: '50%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                {instructor.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </Box>
                                                    <Box>
                                                        <h3>{instructor.name}</h3>
                                                        <p>{instructor.title}, {instructor.company}</p>
                                                        <p>{instructor.bio}</p>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </SpaceBetween>
                                    </Container>
                                )
                            },
                            {
                                label: "Materials",
                                id: "materials",
                                content: (
                                    <Container>
                                        <Cards
                                            cardDefinition={{
                                                header: item => (
                                                    <Link fontSize="heading-m">{item.title}</Link>
                                                ),
                                                sections: [
                                                    {
                                                        id: "description",
                                                        header: "Description",
                                                        content: item => item.description
                                                    },
                                                    {
                                                        id: "link",
                                                        header: "Link",
                                                        content: item => (
                                                            <Box>
                                                                <Button
                                                                    iconName="external"
                                                                    iconAlign="right"
                                                                    href={item.url}
                                                                    target="_blank"
                                                                >
                                                                    Access material
                                                                </Button>
                                                            </Box>
                                                        )
                                                    }
                                                ]
                                            }}
                                            cardsPerRow={[
                                                { cards: 1 },
                                                { minWidth: 500, cards: 2 }
                                            ]}
                                            items={course.materials}
                                            loadingText="Loading materials"
                                            empty={
                                                <Box textAlign="center" color="inherit">
                                                    <b>No materials</b>
                                                    <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                                                        No course materials are currently available.
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </Container>
                                )
                            }
                        ]}
                    />

                    {/* 사전 평가 섹션 */}
                    <Container
                        header={<Header variant="h2">Pre-Course Assessments</Header>}
                    >
                        <SpaceBetween size="m">
                            <Alert type="info" header="Complete before starting">
                                Please complete the following assessments before the first session to help us tailor the course to your needs.
                            </Alert>

                            <Cards
                                cardDefinition={{
                                    header: item => item.title,
                                    sections: [
                                        {
                                            id: "description",
                                            content: item => item.description
                                        },
                                        {
                                            id: "action",
                                            content: item => (
                                                <Button disabled={!item.available}>
                                                    {item.actionText}
                                                </Button>
                                            )
                                        }
                                    ]
                                }}
                                cardsPerRow={[
                                    { cards: 1 },
                                    { minWidth: 500, cards: 2 }
                                ]}
                                items={[
                                    {
                                        title: "Pre-Course Survey",
                                        description: "A brief survey to understand your expectations and experience level. Takes approximately 5 minutes to complete.",
                                        available: true,
                                        actionText: "Start Survey"
                                    },
                                    {
                                        title: "Pre-Quiz Assessment",
                                        description: "This quiz helps us gauge your current knowledge of AWS services. Takes approximately 15 minutes to complete.",
                                        available: true,
                                        actionText: "Take Pre-Quiz"
                                    }
                                ]}
                            />
                        </SpaceBetween>
                    </Container>

                    {/* FAQ 섹션 */}
                    <Container
                        header={<Header variant="h2">Frequently Asked Questions</Header>}
                    >
                        <SpaceBetween size="l">
                            <ExpandableSection headerText="What happens after I enroll?">
                                <p>After enrolling, you'll receive a confirmation email with details about how to access the course. You'll also gain access to pre-course materials and assessments.</p>
                            </ExpandableSection>

                            <ExpandableSection headerText="Is this course eligible for AWS Certification?">
                                <p>This course helps prepare you for the AWS Certified Cloud Practitioner exam, but certification requires a separate exam registration and fee.</p>
                            </ExpandableSection>

                            <ExpandableSection headerText="What if I need to cancel my enrollment?">
                                <p>Cancellations made at least 7 days before the course start date are eligible for a full refund. Please contact our support team for assistance.</p>
                            </ExpandableSection>

                            <ExpandableSection headerText="Are there any additional resources available?">
                                <p>Yes! Enrolled students will have access to AWS documentation, practice exercises, and sample questions similar to those on the certification exam.</p>
                            </ExpandableSection>
                        </SpaceBetween>
                    </Container>

                    {/* 관련 과정 제안 */}
                    <Container
                        header={<Header variant="h2">Related Courses</Header>}
                    >
                        <Cards
                            cardDefinition={{
                                header: item => item.title,
                                sections: [
                                    {
                                        id: "description",
                                        content: item => item.description
                                    },
                                    {
                                        id: "level",
                                        header: "Level",
                                        content: item => item.level
                                    },
                                    {
                                        id: "action",
                                        content: item => (
                                            <Button onClick={() => navigate(`/course/\${item.id}`)}>
                                                View details
                                            </Button>
                                        )
                                    }
                                ]
                            }}
                            cardsPerRow={[
                                { cards: 1 },
                                { minWidth: 500, cards: 2 },
                                { minWidth: 992, cards: 3 }
                            ]}
                            items={[
                                {
                                    id: "solutions-architect",
                                    title: "AWS Solutions Architect Associate",
                                    description: "Learn to design available, cost-efficient, fault-tolerant, and scalable distributed systems on AWS.",
                                    level: "Associate"
                                },
                                {
                                    id: "developer-associate",
                                    title: "AWS Developer Associate",
                                    description: "Learn to develop and maintain AWS-based applications with a focus on coding, security, and deployment.",
                                    level: "Associate"
                                }
                            ]}
                        />
                    </Container>
                </SpaceBetween>
            </ContentLayout>
        </MainLayout>
    );
};

// 필요한 Link 컴포넌트 추가
const Link: React.FC<{
    children: React.ReactNode;
    fontSize?: string;
}> = ({ children, fontSize }) => (
    <span style={{ fontSize: fontSize || 'inherit', color: '#0073bb', cursor: 'pointer' }}>
        {children}
    </span>
);

export default CourseDetailPage;