const puppeteer = require('puppeteer')

/*
{
            //headless: false,
            //devtools: true,
            //slowMo: 250
        }
 */

describe('User end-to-end and unit tests', () => {

    let user_id = {};
    let channel_id = {};
    let data = {
        email: 'bjff124vf5d0@gmail.com',
        password: 'Bjff124vf5d0',
        username: 'bjff124vf5d0'
    }

    const waitForResponse = (page, url) => {
        return new Promise(resolve => {
            page.on("response", function callback(response){
                if (response.url() === url) {
                    resolve(response);
                    page.removeListener("response",callback)
                }
            })
        })
    };

    const login = async (page) => {
        await page.goto('https://api-tester.hiick.now.sh/')

        await page.type('input[name="login-email"]', data.email)
        await page.click("input[name=login-password]");
        await page.type('input[name="login-password"]', data.password)

        await page.click('form#login_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/auth/login");
    }

    const getLogged = async (page) => {
        await page.goto('https://api-tester.hiick.now.sh/')

        await page.click('form#get_user_connected_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/authorized/users/logged");

        const element = await page.$("#get_user_connected_json_response");
        const text = await page.evaluate(element => JSON.parse(element.textContent), element);

        user_id = text.user[0].user_id
        channel_id = text.user[0].channel_id
    }

    test("Register new user", async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await page.goto('https://api-tester.hiick.now.sh/')

        await page.type('input[name="email"]', data.email)
        await page.click("input[name=username]");
        await page.type('input[name="username"]', data.username)
        await page.click("input[name=password]");
        await page.type('input[name="password"]', data.password)

        await page.click('form#register_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/auth/register");

        const element = await page.$("#register_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({ message: { message: "Inscription utilisateur et sa chaîne effectué avec succès !"}})
        expect(JSON.parse(text)).toMatchObject({ error: null })

        await browser.close();
    }, 9000000);

    test("Login user", async () => {
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            slowMo: 250
        })
        const page = await browser.newPage()

        await login(page);

        const element = await page.$("#login_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({ message: { message: "Connected !"}})
        expect(JSON.parse(text)).toMatchObject({ "error": null })

        await browser.close();
    }, 9000000);

    /*test("Forgot Password Send Email", async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await page.goto('https://api-tester.hiick.now.sh/')

        await page.type('input[name="email-forgot"]', 'alex.mignon77@gmail.com')

        await page.click('form#forgot_pass_email_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/auth/forgot/password");

        const element = await page.$("#forgot_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({ message: "Email successfully sent !" })
        expect(JSON.parse(text)).toMatchObject({ success: true })
        expect(JSON.parse(text)).toMatchObject({ response: { accepted: [ "alex.mignon77@gmail.com" ] }})

        await browser.close();
    }, 9000000);*/

    test("Get connected user", async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await login(page)
        await getLogged(page)

        const element = await page.$("#get_user_connected_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({ success: true })
        expect(JSON.parse(text)).toMatchObject({ user: [{
                email: data.email,
                username: data.username,
                status: "ACTIVE",
                role: "ROLE_USER"
            }] })

        await browser.close();
    }, 9000000)

    test("Update user A FAIRE", async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await login(page)
        await getLogged(page)

        await page.click("input[name=get_user_connected_password]");
        await page.type('input[name="get_user_connected_password"]', data.password)

        await page.click('form#update_user_password_connected_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/authorized/users/password/"+user_id);

        const element = await page.$("#update_user_password_connected_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({ success: true, message: "Mot de passe mis à jour !" })

        await browser.close();
    }, 9000000)

    test("Update password", async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await login(page)
        await getLogged(page)

        await page.click("input[name=get_user_connected_password]");
        await page.type('input[name="get_user_connected_password"]', data.password)

        await page.click('form#update_user_password_connected_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/authorized/users/password/"+user_id);

        const element = await page.$("#update_user_password_connected_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({ success: true, message: "Mot de passe mis à jour !" })

        await browser.close();
    }, 9000000)

    test("Get user channel", async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await login(page)
        await getLogged(page)

        await page.click('form#get_user_channel_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/authorized/channels/"+channel_id);

        const element = await page.$("#get_user_channel_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({
            success: true,
            channel: {
                _id: channel_id,
                user_id: JSON.stringify(user_id),
                radio: false,
                status: "ACTIVE",
                live: false
            }
        })

        await browser.close();
    }, 9000000)

    test("Update channel A FAIRE", async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await login(page)
        await getLogged(page)

        await page.click('form#get_user_channel_form input[type="submit"]')

        await waitForResponse(page,"https://webradio-stream.herokuapp.com/authorized/channels/"+channel_id);

        const element = await page.$("#get_user_channel_json_response");
        const text = await page.evaluate(element => element.textContent, element);

        expect(JSON.parse(text)).toMatchObject({
            success: true,
            channel: {
                _id: channel_id,
                user_id: JSON.stringify(user_id),
                radio: false,
                status: "ACTIVE",
                live: false
            }
        })

        await browser.close();
    }, 9000000)

})

