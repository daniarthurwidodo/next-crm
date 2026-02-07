# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Dashboard" [ref=e5] [cursor=pointer]:
        - /url: /dashboard
    - main [ref=e6]:
      - main [ref=e7]:
        - heading "Login" [level=1] [ref=e8]
        - generic [ref=e9]:
          - textbox "Username" [ref=e10]: testuser1770472033278
          - textbox "Password" [ref=e11]: testpassword
          - generic [ref=e12]: User not found
          - button "Login" [active] [ref=e13]
        - paragraph [ref=e14]:
          - text: Don't have an account?
          - link "Register" [ref=e15] [cursor=pointer]:
            - /url: /dashboard/register
  - button "Open Next.js Dev Tools" [ref=e21] [cursor=pointer]:
    - img [ref=e22]
  - alert [ref=e25]
```