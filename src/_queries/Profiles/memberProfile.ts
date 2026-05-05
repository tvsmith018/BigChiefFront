export const MEMBER_PROFILE_QUERY = `
  query MemberProfile($userId: Decimal!, $firstFollows: Int!, $firstPosts: Int!, $firstImages: Int!) {
    users(id: $userId, first: 1) {
      edges {
        node {
          id
          firstname
          lastname
          email
          avatarUrl
        }
      }
    }

    userProfileSettings(user: $userId, first: 1) {
      edges {
        node {
          id
          profileIsPublic
          allowMessages
          showActivityFeed
          showWatchHistory
          showRatings
          showUploadedImages
          receiveNotifications
          receiveMarketingNotifications
          disabledAt
          deleteRequestedAt
          metadata
          createdAt
          updatedAt
        }
      }
    }

    followers: profileFollows(following: $userId, first: $firstFollows) {
      edges {
        node {
          id
          status
          createdAt
          updatedAt
          follower {
            id
            firstname
            lastname
            email
            avatarUrl
          }
          following {
            id
            firstname
            lastname
            email
            avatarUrl
          }
        }
      }
    }

    following: profileFollows(follower: $userId, first: $firstFollows) {
      edges {
        node {
          id
          status
          createdAt
          updatedAt
          follower {
            id
            firstname
            lastname
            email
            avatarUrl
          }
          following {
            id
            firstname
            lastname
            email
            avatarUrl
          }
        }
      }
    }

    profilePosts(user: $userId, first: $firstPosts) {
      edges {
        node {
          id
          body
          status
          likesCount
          repliesCount
          metadata
          createdAt
          updatedAt
          article {
            id
            title
            image1x1Url
            altImage
            category
          }
        }
      }
    }

    profileImages(user: $userId, first: $firstImages) {
      edges {
        node {
          id
          caption
          visibility
          sortOrder
          isFeatured
          imageUrl
          createdAt
          updatedAt
        }
      }
    }
  }
`;
