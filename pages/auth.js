import { useEffect } from 'react'
import { Container, Grid, Loading, Text } from '@nextui-org/react'
import Router from 'next/router'
import FormData from 'form-data'

const Auth = ({profile, igToken}) => {
    useEffect(() => {
        if (profile) {
            localStorage.setItem('auth', igToken)
            localStorage.setItem('username', profile.username)
            setTimeout(() => {
                Router.push('/')
            }, 2000)
        } else {
            Router.push('/')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container className="App bg-ig-dot" style={{marginTop: '-60px'}}>
            <Grid.Container gap={2}>
                <Grid xs={12} justify="center">
                    <Text h3>Welcome, {profile?.username}</Text>
                </Grid>
                <Grid xs={12} justify="center">
                    <Loading color="error" size="lg"/>
                </Grid>
            </Grid.Container>
        </Container>
    )
}

export const getServerSideProps = async ({query}) => {
    const {code} = query
    let profile = null
    let igToken = null
    if (code) {
        let bodyFormData = new FormData()
        bodyFormData.append('client_id', '1158691484675995')
        bodyFormData.append('client_secret', '5bc08d49b174ce362cc352d0eb16d461')
        bodyFormData.append('grant_type', 'authorization_code')
        bodyFormData.append('code', code)
        bodyFormData.append('redirect_uri', 'https://arcade.miechayakorn.tk/auth')

        const AuthRes = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'post',
            body: bodyFormData,
        })
        if (AuthRes.status === 200) {
            const auth = await AuthRes.json()
            const accessToken = auth.access_token
            const userId = auth.user_id
            const profileRes = await fetch('https://graph.instagram.com/' + userId + '?fields=id,username&access_token=' + accessToken, {
                method: 'get'
            })
            if (profileRes.status === 200) {
                profile = await profileRes.json()
                igToken = accessToken
            }
        }
    }

    return {
        props: {
            profile,
            igToken
        },
    }
}

export default Auth