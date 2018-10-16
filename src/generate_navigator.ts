import { mkdir, writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

const src = `
import classNames from "classnames";
import Link from "next/link";
import React, { Component, Fragment } from "react";

import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from '@material-ui/core/ListSubheader';
import {
    createStyles,
    Theme,
    withStyles,
    WithStyles
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import HomeIcon from "@material-ui/icons/Home";

const drawerWidth = 240;

// https://github.com/logos
const githubIcon = \`iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzlFQkFERkU4NkJCMTFFM0FBNTJFRTMzNTJEMUJDNDYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzlFQkFERkQ4NkJCMTFFM0FBNTJFRTMzNTJEMUJDNDYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU1MTc4QTJFOTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU1MTc4QTJGOTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Kk5lQwAABYxJREFUeNrkm29oVXUYx3+7bM3V1FnbqlltrtXWtYRa1nqxooY5E7EhKWGuaTDBagol9SIMDCKICASj+cISw/DPi16ZBakrUBnoC7nNoTMWy6I1c+LmVq6t78N9jpyu555znt855+536IHPi939/jzP95zznN+/kzc1NaUitirwJJgPasF94DZQDG7hMqNgBFwEZ5kU+AH0R+lcXgQCJMBT4EXwLKgM2N7P4FvwJegCk6YKUA5eB23grogu2C/gc7AN/GGKABTsZtAOZqjc2DjYAT5kUfSNBNCkAGwGo1PTZ6PsQ4FuHLp3QD3YDR5QZtgZsAac1ElYokcGbATHDApesS/kUwf7GEkOKAK7wAvKbNsPXgZjYQowG3wNnlDxsONgCbgchgAU/GHwiIqXUT5o8hLBKwfcDA7FMHgrUR/iGLQEoGTyBWhQ8bUGjiFPR4A3QIuKv7VwLKIcQMnue5Dv0fjT/IwtAM3g+RyMBmkU+BXf3qc5Rx3xqDPBE7LjfkaCheCcj1HYKYe6JeBt8GcEo75L3HaJQ7+nfNQ/x7H9p67TFX4L1Pi4EocdfhsGH4BPwVbwqu0xGwI/8vT2N/77Gv+vAJSCO3n6PJ//Vjz72w62cPtORnfAwx7+1nBsW93ugGow7vOKtPkYa9eDl0Clxji9kuvW+yjb5tPncY7xet3MhjoFt2RzgIlU2DQL/O6017W/Be4BawXJqMCgTH+ToOxajvWG1+AmYVBlBglQKrxwmzIFoB9XCzt91CABpL6sti62JcBiXtKS2GMGCSD1pZxjvi7AKmED9PraYJAAG2yvVL+2yi7AImHl90C3QQJ03/B+97ZF1lCYVlN6BBV/BffykNQkoyF4H5grqJOkO6BR2NF2A4O35gifCOs0JjTW9vYaPPPbJ11LJAFqBRVoDf68wQLQI3BBUL424XPiY1lvDOb/ZwRla0iAOYIKv8dAgEFB2VtJgJmCChMxEEAyHigmAQoFFWbFQIDZgrKF0p2hmTEQQOQjCTAmKD8vBgJUCcqOkQBXBBXosEORwcEXKdmBjCskwICgQr5h0+BMW6i8V7LtNkAC9As7WWqwAM8Jy/cnhBMhspVKvq2eC0uwbxLrSWhMa+dpdJQLW6mRpLtpOlyuMcL7CTwErhoSPG2ApjQEuD3BQ0fp0ZJqlT6pZYpt0wieYh60nuWDGp2+At4xIPgt7IvU0jHzBkFdgD27HWDGNGyGFHHfulaXuTN0IkBjZ8EykJeDwKmPFtAXwN8TTltjrVkKfwcawXJW3G3v8DTYCKoiCLwGvAl6QthpbnU6J5jP2f1uh1Wgxbbxwv0qvT/vtZRGA6wuzs50+Pkb8JdgQtPMq1VJld7bnxtSzhjgJD5hzwEW611OZK6xlSvzeYbAsl3Cx4PK7ozodOl6t93hfJByqbzOVnYh+MdHhxfBLI1bnuoMhRx8imPMKgDR5LG/nrSVfddHpx8HeO4/ClmApsw+snXsdk7gYMat+r5Hp0sDCLAkxOA7nfrI1nGxx2tmQUb5x8FuzgvD4Dw4wNm2MIAA1SEF38cx+RaAeBCMZGlwb44GOyUhBD/CsTj24TatpddXq3L+RIVmXnE4QzjJMaSylvBxFdqzKHsVrDD8Dmj36sOvIx0unewHDRENg4MI0BH2FyP0RcZOlzW3Ib7VLvPqDK0z1PEq7bDmLVwCLgnr0AhvnUp/0eJp0k9m6HO4fUp2nGZODgUY5PzUJVlHkxg1TEfnjxqY8I6yb12SSjqLm7T9/Ax4TaW/+JxuIx862KcL4toBk1QFT1omXZLRHQHaL3Npl/r8jH3QjiGsbJ3kGd/fDo6WBWi31KG9a9xXMgzfw35tVfCR9l52dk8Ibe7htnq57YowfY7i4+lYWUL9z+1fAQYACqstE4NCc18AAAAASUVORK5CYII=\`;

// https://atlassian.design/guidelines/marketing/resources/logo-files
const bitbucketIcon = \`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\`

export interface IDocument {
    name: string;
    path: string;
}

export interface ISample {
    name: string;
    path: string;
}

export interface IProject {
    name: string;
    homepage?: string;
    homepageType?: string;
}

const styles = (theme: Theme) => {
    return createStyles({
        root: {
            display: "flex"
        },
        toolbar: {
            paddingRight: 24 // keep right padding when drawer closed
        },
        toolbarIcon: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 8px",
            ...theme.mixins.toolbar
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen
            })
        },
        appBarShift: {
            marginLeft: drawerWidth,
            width: \`calc(100% - \${drawerWidth}px)\`,
            transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
            })
        },
        menuButton: {
            marginLeft: 12,
            marginRight: 36
        },
        menuButtonHidden: {
            display: "none"
        },
        title: {
            flexGrow: 1
        },
        drawerPaper: {
            position: "relative",
            whiteSpace: "nowrap",
            width: drawerWidth,
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
            })
        },
        drawerPaperClose: {
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen
            }),
            width: theme.spacing.unit * 7,
            [theme.breakpoints.up("sm")]: {
                width: theme.spacing.unit * 9
            }
        },
        appBarSpacer: theme.mixins.toolbar,
        content: {
            flexGrow: 1,
            padding: theme.spacing.unit * 3,
            height: "100vh",
            overflow: "auto"
        },
        chartContainer: {
            marginLeft: -22
        },
        tableContainer: {
            height: 320
        }
    });
};

interface IProps {
    children?: React.ReactNode;
    project: IProject;
    currentPath: string;
    docs: IDocument[];
    samples: IDocument[];
}

class Navigator extends Component<IProps & WithStyles<typeof styles>> {
    constructor(props: IProps & WithStyles<typeof styles>) {
        super(props);
    }

    public handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    public handleDrawerClose = () => {
        this.setState({ open: false });
    };

    private renderHomePageButton(): React.ReactNode | null {
        if (!this.props.project.homepage) {
            return null;
        } else if (this.props.project.homepageType === "github") {
            return <a href={this.props.project.homepage}>
                <IconButton color="inherit">
                    <img
                        style={{ width: 24, height: 24 }}
                        src={\`data:image/png;base64,\${githubIcon}\`}
                    />
                </IconButton>
            </a>;
        } else if (this.props.project.homepageType === "bitbucket") {
            return <a href={this.props.project.homepage}>
                <IconButton color="inherit">
                    <img
                        style={{ width: 24, height: 24 }}
                        src={\`data:image/png;base64,\${bitbucketIcon}\`}
                    />
                </IconButton>
            </a>;
        } else {
            return <a href={this.props.project.homepage}>
                <IconButton color="inherit">
                    <HomeIcon nativeColor="white"></HomeIcon>
                </IconButton>
            </a>;
        }
    }

    public render() {
        const { classes } = this.props;


        return (
            <Fragment>
                <CssBaseline />
                <div className={classes.root}>
                    <AppBar
                        position="absolute"
                        className={classNames(
                            classes.appBar,
                            classes.appBarShift
                        )}
                    >
                        <Toolbar
                            disableGutters={false}
                            className={classes.toolbar}
                        >
                            <Link href="/">
                                <Typography
                                    component="h1"
                                    variant="title"
                                    color="inherit"
                                    noWrap={true}
                                    className={classes.title}
                                >
                                    {this.props.project.name}
                                </Typography>
                            </Link>
                            {this.renderHomePageButton()}
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        variant="permanent"
                        classes={{
                            paper: classNames(classes.drawerPaper)
                        }}
                        anchor={"left"}
                    >
                        <List
                            component="nav"
                            subheader={<ListSubheader component="div">Samples</ListSubheader>}
                        >
                            {this.props.samples.map(({ name, path }) => {
                                return (
                                    <ListItem
                                        key={path}
                                        button={true}
                                        selected={
                                            path === this.props.currentPath
                                        }
                                    >
                                        <Link href={\`/\${path}\`}>
                                            <ListItemText primary={name} />
                                        </Link>
                                    </ListItem>
                                );
                            })}
                        </List>
                        {this.props.docs.length > 0 ?
                            <Fragment>
                                <Divider />
                                <List
                                    component="nav"
                                    subheader={<ListSubheader component="div">Documents</ListSubheader>}
                                >
                                    {this.props.docs.map(({ name, path }) => {
                                        return (
                                            <ListItem
                                                key={path}
                                                button={true}
                                                selected={
                                                    path === this.props.currentPath
                                                }
                                            >
                                                <Link href={\`/\${path}\`}>
                                                    <ListItemText primary={name} />
                                                </Link>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Fragment>
                        : null}
                    </Drawer>
                    <main className={classes.content}>
                        <div className={classes.appBarSpacer} />
                        {this.props.children}
                    </main>
                </div>
            </Fragment>
        );
    }
}

const StyledNavigator = withStyles(styles)(Navigator);

export { StyledNavigator as Navigator };

`;

export async function generateNavigator(projectPath: string) {
    try {
        await mkdirAsync(join(projectPath, "src"));
    } catch (_) {
        // do nothing;
    }
    await writeFileAsync(
        join(projectPath, "src", "_navigator.tsx"),
        src,
        "utf8"
    );
}
